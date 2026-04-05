from unittest.mock import AsyncMock, patch

import pytest
from langchain_core.messages import AIMessage

from app.agents import critic, executor, planner, researcher
from app.agents.graph import build_graph, should_revise

# ---------------------------------------------------------------------------
# Planner
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_planner_returns_plan(sample_state):
    mock_response = AIMessage(content="1. Research topic\n2. Analyze data\n3. Write summary")

    with patch("app.agents.planner.ChatOpenAI") as MockLLM:
        instance = MockLLM.return_value
        instance.ainvoke = AsyncMock(return_value=mock_response)

        result = await planner.run(sample_state)

    assert isinstance(result["plan"], list)
    assert len(result["plan"]) >= 1
    assert result["current_agent"] == "planner"
    assert any(e["type"] == "output" for e in result["events"])


# ---------------------------------------------------------------------------
# Researcher
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_researcher_calls_search(sample_state):
    mock_search_results = [
        {"title": "AI Trends 2024", "url": "https://example.com", "snippet": "AI is booming"},
    ]
    mock_synthesis = AIMessage(content="AI is advancing rapidly in 2024.")

    with (
        patch("app.agents.researcher.web_search", AsyncMock(return_value=mock_search_results)),
        patch("app.agents.researcher.ChatOpenAI") as MockLLM,
    ):
        instance = MockLLM.return_value
        instance.ainvoke = AsyncMock(return_value=mock_synthesis)

        result = await researcher.run(sample_state)

    tool_events = [e for e in result["events"] if e["type"] == "tool_call"]
    assert len(tool_events) >= 1
    assert tool_events[0]["tool"] == "web_search"
    assert result["research"]
    assert result["current_agent"] == "researcher"


# ---------------------------------------------------------------------------
# Executor
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_executor_produces_draft(sample_state):
    mock_response = AIMessage(content="# AI Trends Report\n\nAI is transforming industries...")

    with patch("app.agents.executor.ChatOpenAI") as MockLLM:
        instance = MockLLM.return_value
        instance.ainvoke = AsyncMock(return_value=mock_response)

        result = await executor.run(sample_state)

    assert result["draft"]
    assert len(result["draft"]) > 0
    assert result["iterations"] == 1
    assert result["current_agent"] == "executor"


@pytest.mark.asyncio
async def test_executor_runs_code_for_code_tasks(sample_state):
    sample_state["task"] = "Write a Python script to calculate compound interest"
    code_draft = "Here's the script:\n\n```python\nprint('Result: 1000')\n```\n\nThis calculates..."
    mock_response = AIMessage(content=code_draft)

    with (
        patch("app.agents.executor.ChatOpenAI") as MockLLM,
        patch("app.agents.executor.execute_python") as mock_exec,
    ):
        instance = MockLLM.return_value
        instance.ainvoke = AsyncMock(return_value=mock_response)
        mock_exec.return_value = {"output": "Result: 1000\n", "error": None, "success": True}

        result = await executor.run(sample_state)

    mock_exec.assert_called_once()
    tool_events = [e for e in result["events"] if e["type"] == "tool_call"]
    assert len(tool_events) >= 1


# ---------------------------------------------------------------------------
# Critic
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_critic_approves(sample_state):
    sample_state["draft"] = "A detailed and comprehensive report on AI trends..."
    mock_response = AIMessage(content="APPROVED: The draft thoroughly addresses the task.")

    with patch("app.agents.critic.ChatOpenAI") as MockLLM:
        instance = MockLLM.return_value
        instance.ainvoke = AsyncMock(return_value=mock_response)

        result = await critic.run(sample_state)

    assert "APPROVED" in result["critique"]
    assert result["final_output"]
    assert result["status"] == "complete"


@pytest.mark.asyncio
async def test_critic_requests_revision(sample_state):
    sample_state["draft"] = "Short draft."
    mock_response = AIMessage(content="REVISE: The draft lacks depth. Add more examples.")

    with patch("app.agents.critic.ChatOpenAI") as MockLLM:
        instance = MockLLM.return_value
        instance.ainvoke = AsyncMock(return_value=mock_response)

        result = await critic.run(sample_state)

    assert "REVISE" in result["critique"]
    assert "final_output" not in result or not result.get("final_output")


# ---------------------------------------------------------------------------
# Router logic
# ---------------------------------------------------------------------------


def test_should_revise_loops_when_revise_and_low_iterations():
    state = {"critique": "REVISE: needs work", "iterations": 1}
    assert should_revise(state) == "executor"


def test_should_revise_ends_at_max_iterations():
    state = {"critique": "REVISE: still needs work", "iterations": 2}
    assert should_revise(state) != "executor"


def test_should_revise_ends_on_approval():
    state = {"critique": "APPROVED: looks great", "iterations": 1}
    assert should_revise(state) != "executor"


# ---------------------------------------------------------------------------
# End-to-end graph (all LLM + search mocked)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_graph_runs_end_to_end():
    plan_msg = AIMessage(content="1. Research AI\n2. Analyze findings\n3. Write report")
    synthesis_msg = AIMessage(content="AI is advancing in multiple domains.")
    draft_msg = AIMessage(content="# Report\n\nAI trends are fascinating and impactful.")
    approve_msg = AIMessage(content="APPROVED: Excellent coverage of the topic.")

    search_results = [{"title": "AI", "url": "https://example.com", "snippet": "AI info"}]

    with (
        patch("app.agents.planner.ChatOpenAI") as MockPlannerLLM,
        patch("app.agents.researcher.web_search", AsyncMock(return_value=search_results)),
        patch("app.agents.researcher.ChatOpenAI") as MockResearcherLLM,
        patch("app.agents.executor.ChatOpenAI") as MockExecutorLLM,
        patch("app.agents.critic.ChatOpenAI") as MockCriticLLM,
    ):
        MockPlannerLLM.return_value.ainvoke = AsyncMock(return_value=plan_msg)
        MockResearcherLLM.return_value.ainvoke = AsyncMock(return_value=synthesis_msg)
        MockExecutorLLM.return_value.ainvoke = AsyncMock(return_value=draft_msg)
        MockCriticLLM.return_value.ainvoke = AsyncMock(return_value=approve_msg)

        graph = build_graph()
        initial = {
            "task": "Research the latest AI trends",
            "plan": [],
            "research": "",
            "draft": "",
            "critique": "",
            "final_output": "",
            "messages": [],
            "current_agent": "",
            "iterations": 0,
            "events": [],
            "status": "running",
        }
        result = await graph.ainvoke(initial)

    assert result["status"] == "complete"
    assert result["final_output"]
    assert len(result["events"]) > 0
