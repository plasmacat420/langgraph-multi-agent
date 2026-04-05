import operator
from typing import Annotated, Sequence, TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    task: str
    plan: list[str]
    research: str
    draft: str
    critique: str
    final_output: str
    messages: Annotated[Sequence[BaseMessage], operator.add]
    current_agent: str
    iterations: int
    events: Annotated[list[dict], operator.add]
    status: str
