from datetime import datetime, timezone

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.agents.state import AgentState
from app.config import settings
from app.tools.search import web_search


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


async def run(state: AgentState) -> AgentState:
    """Research each subtask using web search."""
    plan = state.get("plan", [state["task"]])

    events = [
        {
            "agent": "researcher",
            "type": "thought",
            "content": (
                f"I will research {len(plan)} subtasks using web search to gather "
                "relevant information and synthesize my findings."
            ),
            "timestamp": _ts(),
        }
    ]

    all_results: list[str] = []

    for subtask in plan:
        query = subtask
        results = await web_search(query, max_results=4)

        formatted = "\n".join(f"- [{r['title']}]({r['url']}): {r['snippet']}" for r in results)

        events.append(
            {
                "agent": "researcher",
                "type": "tool_call",
                "tool": "web_search",
                "content": f"Query: {query}",
                "input": query,
                "output": formatted or "No results found.",
                "timestamp": _ts(),
            }
        )

        if results:
            all_results.append(f"### {subtask}\n{formatted}")

    raw_findings = "\n\n".join(all_results) if all_results else "No search results found."

    llm = ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0.3,
    )

    synthesis_messages = [
        SystemMessage(
            content=(
                "You are a research analyst. Synthesize the following search results "
                "into a coherent research summary. Focus on factual, relevant information. "
                "Organize by topic. Be comprehensive but concise."
            )
        ),
        HumanMessage(
            content=(f"Original task: {state['task']}\n\nSearch findings:\n{raw_findings}")
        ),
    ]

    synthesis = await llm.ainvoke(synthesis_messages)
    research_summary = synthesis.content.strip()

    events.append(
        {
            "agent": "researcher",
            "type": "output",
            "content": f"Research complete. Synthesized findings from {len(plan)} queries.",
            "timestamp": _ts(),
        }
    )
    events.append(
        {
            "agent": "researcher",
            "type": "handoff",
            "content": "Handing off research findings to Executor agent.",
            "timestamp": _ts(),
        }
    )

    return {
        "research": research_summary,
        "current_agent": "researcher",
        "events": events,
        "messages": [synthesis],
    }
