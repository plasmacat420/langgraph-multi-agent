from datetime import datetime, timezone

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.agents.state import AgentState
from app.config import settings


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


async def run(state: AgentState) -> AgentState:
    """Break the task into 3-5 concrete subtasks."""
    task = state["task"]

    thought_content = (
        f"I need to analyze the task and break it into manageable subtasks. Task: {task}"
    )

    events = [
        {
            "agent": "planner",
            "type": "thought",
            "content": thought_content,
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
                "You are a strategic task planner. Break the given task into 3-5 "
                "concrete, actionable subtasks. Return ONLY a numbered list, one subtask "
                "per line. Each subtask should be specific and achievable. No extra text."
            )
        ),
        HumanMessage(content=f"Task: {task}"),
    ]

    response = await llm.ainvoke(messages)
    raw_plan = response.content.strip()

    plan = []
    for line in raw_plan.splitlines():
        line = line.strip()
        if not line:
            continue
        # Strip leading numbering like "1." or "1)"
        for sep in [". ", ") ", "- "]:
            if sep in line[:4]:
                line = line.split(sep, 1)[-1].strip()
                break
        if line:
            plan.append(line)

    plan = plan[:5] if plan else [task]

    events.append(
        {
            "agent": "planner",
            "type": "output",
            "content": "Plan created:\n" + "\n".join(f"{i + 1}. {s}" for i, s in enumerate(plan)),
            "timestamp": _ts(),
        }
    )
    events.append(
        {
            "agent": "planner",
            "type": "handoff",
            "content": "Handing off to Researcher agent with the plan.",
            "timestamp": _ts(),
        }
    )

    return {
        "plan": plan,
        "current_agent": "planner",
        "events": events,
        "messages": [response],
    }
