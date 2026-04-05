import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from loguru import logger

from app.agents.graph import agent_graph
from app.agents.state import AgentState
from app.models import TaskRequest, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# In-memory task store. In production, use Redis.
_tasks: dict[str, dict] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _run_graph(task_id: str, task: str) -> None:
    """Execute the agent graph and update the task store."""
    _tasks[task_id]["status"] = "running"
    try:
        initial_state: AgentState = {
            "task": task,
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
        final_state = await agent_graph.ainvoke(initial_state)

        _tasks[task_id].update(
            {
                "status": final_state.get("status", "complete"),
                "final_output": final_state.get("final_output", final_state.get("draft", "")),
                "events": final_state.get("events", []),
                "done": True,
            }
        )
    except Exception as exc:
        logger.exception(f"Task {task_id} failed: {exc}")
        _tasks[task_id].update(
            {
                "status": "failed",
                "error": str(exc),
                "events": _tasks[task_id].get("events", [])
                + [
                    {
                        "agent": "system",
                        "type": "error",
                        "content": f"Task failed: {exc}",
                        "timestamp": _now(),
                    }
                ],
                "done": True,
            }
        )


@router.post("", response_model=TaskResponse)
async def create_task(request: TaskRequest) -> TaskResponse:
    task_id = str(uuid.uuid4())
    created_at = _now()

    _tasks[task_id] = {
        "id": task_id,
        "task": request.task,
        "status": "pending",
        "created_at": created_at,
        "events": [],
        "final_output": "",
        "done": False,
    }

    asyncio.create_task(_run_graph(task_id, request.task))
    logger.info(f"Task {task_id} created: {request.task[:60]}")

    return TaskResponse(
        id=task_id,
        task=request.task,
        status="pending",
        created_at=created_at,
    )


async def _event_stream(task_id: str) -> AsyncGenerator[str, None]:
    """Yield SSE events as they arrive."""
    sent_count = 0

    while True:
        task = _tasks.get(task_id)
        if task is None:
            yield f"data: {json.dumps({'type': 'error', 'content': 'Task not found'})}\n\n"
            return

        events = task.get("events", [])
        # Send any new events
        while sent_count < len(events):
            event = events[sent_count]
            yield f"data: {json.dumps(event)}\n\n"
            sent_count += 1

        if task.get("done"):
            final = {
                "type": "complete",
                "status": task["status"],
                "final_output": task.get("final_output", ""),
            }
            if task["status"] == "failed":
                final["error"] = task.get("error", "Unknown error")
            yield f"data: {json.dumps(final)}\n\n"
            return

        # Heartbeat while waiting
        yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
        await asyncio.sleep(2)


@router.get("/{task_id}/stream")
async def stream_task(task_id: str) -> StreamingResponse:
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return StreamingResponse(
        _event_stream(task_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{task_id}")
async def get_task(task_id: str) -> dict:
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    task = _tasks[task_id].copy()
    task.pop("done", None)
    return task
