from datetime import datetime, timezone

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.agents.state import AgentState
from app.config import settings
from app.tools.code_executor import execute_python


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


_CODE_KEYWORDS = ("script", "code", "function", "program", "calculate", "compute", "python")


async def run(state: AgentState) -> AgentState:
    """Produce the actual output using plan + research."""
    task = state["task"]
    plan = state.get("plan", [])
    research = state.get("research", "")
    critique = state.get("critique", "")
    iterations = state.get("iterations", 0)

    thought_parts = [
        f"Iteration {iterations + 1}: Producing output for task.",
    ]
    if critique and "REVISE" in critique:
        feedback = critique.replace("REVISE:", "").strip()
        thought_parts.append(f"Addressing critic feedback: {feedback}")

    events = [
        {
            "agent": "executor",
            "type": "thought",
            "content": " ".join(thought_parts),
            "timestamp": _ts(),
        }
    ]

    needs_code = any(kw in task.lower() for kw in _CODE_KEYWORDS)

    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.4,
    )

    system_prompt = (
        "You are an expert executor agent. Using the provided plan and research, "
        "produce a high-quality, well-structured response to the user's task. "
        "Be thorough, accurate, and well-organized. Use markdown formatting."
    )
    if critique and "REVISE" in critique:
        system_prompt += (
            f"\n\nIMPORTANT: A critic reviewed your previous draft and requested revisions. "
            f"Critique: {critique}\nAddress all feedback points carefully."
        )

    plan_text = "\n".join(f"{i + 1}. {s}" for i, s in enumerate(plan))
    user_content = f"Task: {task}\n\nPlan:\n{plan_text}\n\nResearch findings:\n{research}"

    response = await llm.ainvoke(
        [SystemMessage(content=system_prompt), HumanMessage(content=user_content)]
    )
    draft = response.content.strip()

    # If the task involves coding, extract and run code blocks
    if needs_code:
        import re

        code_blocks = re.findall(r"```python\n(.*?)```", draft, re.DOTALL)
        if code_blocks:
            code = code_blocks[0]
            events.append(
                {
                    "agent": "executor",
                    "type": "tool_call",
                    "tool": "code_executor",
                    "content": f"Executing Python code snippet ({len(code)} chars)",
                    "input": code[:500] + ("..." if len(code) > 500 else ""),
                    "output": "",
                    "timestamp": _ts(),
                }
            )
            result = execute_python(code)
            events[-1]["output"] = (
                result["output"] if result["success"] else f"Error: {result['error']}"
            )
            if result["success"] and result["output"]:
                draft += f"\n\n**Code Execution Output:**\n```\n{result['output']}\n```"

    events.append(
        {
            "agent": "executor",
            "type": "output",
            "content": f"Draft produced ({len(draft)} chars). Sending to Critic for review.",
            "timestamp": _ts(),
        }
    )
    events.append(
        {
            "agent": "executor",
            "type": "handoff",
            "content": "Handing draft to Critic agent for quality review.",
            "timestamp": _ts(),
        }
    )

    return {
        "draft": draft,
        "current_agent": "executor",
        "iterations": iterations + 1,
        "events": events,
        "messages": [response],
    }
