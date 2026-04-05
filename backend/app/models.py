from pydantic import BaseModel


class TaskRequest(BaseModel):
    task: str


class TaskResponse(BaseModel):
    id: str
    task: str
    status: str
    created_at: str


class AgentEvent(BaseModel):
    agent: str
    type: str
    content: str
    tool: str | None = None
    timestamp: str
