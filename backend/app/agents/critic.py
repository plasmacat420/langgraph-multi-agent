from datetime import datetime, timezone

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.agents.state import AgentState
from app.config import settings


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


async def run(state: AgentState) -> AgentState:
    """Review the draft and either approve or request revision."""
    task = state["task"]
    draft = state.get("draft", "")
    iterations = state.get("iterations", 0)

    events = [
        {
            "agent": "critic",
            "type": "thought",
            "content": (
                f"Reviewing draft (iteration {iterations}). Evaluating quality, "
                "completeness, accuracy, and relevance to the original task."
            ),
            "timestamp": _ts(),
        }
    ]

    llm = ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0.2,
    )

    messages = [
        SystemMessage(
            content=(
                "You are a critical reviewer. Evaluate the draft against the original task. "
                "Check for: completeness, accuracy, clarity, structure, and relevance.\n\n"
                "If the draft is good enough (addresses the task well), respond with:\n"
                "APPROVED: [brief explanation of why it meets the bar]\n\n"
                "If the draft needs significant improvement, respond with:\n"
                "REVISE: [specific, actionable feedback on what must be improved]\n\n"
                "Start your response with exactly 'APPROVED:' or 'REVISE:'."
            )
        ),
        HumanMessage(content=f"Original task: {task}\n\nDraft to review:\n{draft}"),
    ]

    response = await llm.ainvoke(messages)
    critique = response.content.strip()

    approved = critique.startswith("APPROVED")

    events.append(
        {
            "agent": "critic",
            "type": "output",
            "content": critique,
            "timestamp": _ts(),
        }
    )

    result: dict = {
        "critique": critique,
        "current_agent": "critic",
        "events": events,
        "messages": [response],
    }

    if approved:
        events.append(
            {
                "agent": "critic",
                "type": "handoff",
                "content": "Draft approved. Task complete.",
                "timestamp": _ts(),
            }
        )
        result["final_output"] = draft
        result["status"] = "complete"
    else:
        events.append(
            {
                "agent": "critic",
                "type": "handoff",
                "content": "Revision requested. Sending back to Executor.",
                "timestamp": _ts(),
            }
        )

    return result
