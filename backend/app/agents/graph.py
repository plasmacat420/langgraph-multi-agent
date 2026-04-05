from langgraph.graph import END, StateGraph

from app.agents import critic, executor, planner, researcher
from app.agents.state import AgentState


def should_revise(state: AgentState) -> str:
    """Router: if critic says REVISE and iterations < 2, loop back to executor."""
    if "REVISE" in state.get("critique", "") and state.get("iterations", 0) < 2:
        return "executor"
    return END


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("planner", planner.run)
    graph.add_node("researcher", researcher.run)
    graph.add_node("executor", executor.run)
    graph.add_node("critic", critic.run)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "researcher")
    graph.add_edge("researcher", "executor")
    graph.add_conditional_edges(
        "critic",
        should_revise,
        {"executor": "executor", END: END},
    )
    graph.add_edge("executor", "critic")

    return graph.compile()


agent_graph = build_graph()
