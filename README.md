# LangGraph Multi-Agent Orchestrator

> Watch multiple AI agents collaborate in real time — planner, researcher, executor, and critic working together to complete complex tasks.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2+-green)](https://github.com/langchain-ai/langgraph)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/plasmacat420/langgraph-multi-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/plasmacat420/langgraph-multi-agent/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://plasmacat420.github.io/langgraph-multi-agent)

---

## What is multi-agent AI?

A single AI agent is like a generalist contractor — it can do a little of everything, but complex projects need specialists. Multi-agent AI splits a hard task across multiple purpose-built agents that each focus on one thing: planning, researching, writing, and reviewing. This division of labor produces higher-quality results and makes the reasoning process transparent and debuggable.

---

## Live Demo

[https://plasmacat420.github.io/langgraph-multi-agent](https://plasmacat420.github.io/langgraph-multi-agent)

> **Note:** The demo frontend requires a running backend with a valid `GROQ_API_KEY`. Point `VITE_API_URL` at your backend or run it locally with Docker Compose.
>
> Backend API (Render): https://langgraph-multi-agent-api.onrender.com

---

## How it works

```
User Task
    ↓
[Planner]    → breaks task into 3-5 concrete subtasks
    ↓
[Researcher] → gathers information using web search (DuckDuckGo)
    ↓
[Executor]   → produces the output using plan + research context
    ↓
[Critic]     → reviews quality → APPROVED or REVISE (loops back max 2×)
    ↓
Final Output
```

Every agent thought, tool call, and handoff streams live to the UI via Server-Sent Events.

---

## Features

- **4 specialized agents** — Planner, Researcher, Executor, Critic, each with a distinct role
- **Live streaming** — watch every agent thought and tool call as it happens via SSE
- **Web search integration** — Researcher agent queries DuckDuckGo in real time
- **Sandboxed code execution** — Executor can write and run Python safely via subprocess
- **Revision loop** — Critic sends work back to Executor if quality isn't high enough (max 2 revisions)
- **Full REST API** — use the backend programmatically without the frontend
- **Dark UI** — real-time agent timeline with color-coded agents and expandable cards
- **Docker ready** — single `docker-compose up` to run the full stack

---

## Quick Start

### Docker Compose (recommended)

```bash
# 1. Clone
git clone https://github.com/plasmacat420/langgraph-multi-agent.git
cd langgraph-multi-agent

# 2. Configure
cp backend/.env.example backend/.env
# Edit backend/.env and set GROQ_API_KEY=sk-...

# 3. Run
docker-compose up --build
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8000  
Health check: http://localhost:8000/health

---

### Manual Setup

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
cp .env.example .env               # add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

### `POST /api/tasks`

Create a new task and start the agent graph in the background.

```json
// Request
{ "task": "Research the latest trends in voice AI" }

// Response
{
  "id": "uuid",
  "task": "...",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### `GET /api/tasks/{id}/stream`

Server-Sent Events stream. Each event is a JSON object:

| `type`      | Fields                                        | Description                  |
|-------------|-----------------------------------------------|------------------------------|
| `thought`   | `agent`, `content`, `timestamp`               | Agent internal reasoning     |
| `tool_call` | `agent`, `tool`, `input`, `output`, `timestamp` | Tool invocation + result   |
| `output`    | `agent`, `content`, `timestamp`               | Agent producing output       |
| `handoff`   | `agent`, `content`, `timestamp`               | Agent passing to next agent  |
| `heartbeat` | —                                             | Keep-alive every 2s          |
| `complete`  | `status`, `final_output`                      | Task finished                |
| `error`     | `content`                                     | Task failed                  |

### `GET /api/tasks/{id}`

Return current task state (status, events, final_output).

---

## Architecture

### StateGraph (LangGraph)

```
planner → researcher → executor → critic
                           ↑          |
                           └──REVISE──┘ (max 2 iterations)
                                      |
                                     END (APPROVED)
```

`AgentState` is a TypedDict that flows through all nodes. Each node reads what it needs and returns only the keys it mutates. Events accumulate via `operator.add` (append-only list), enabling the streaming endpoint to deliver live updates.

### Why SSE?

Server-Sent Events are simpler than WebSockets for unidirectional server→client streaming. No handshake protocol, no frame parsing, built-in browser reconnection. The tradeoff (no client→server push) is acceptable here — clients only need to receive events.

### In-memory task store

Tasks are stored in a Python dict (`_tasks`) for simplicity. In production, replace with Redis (use `aioredis` + pub/sub for the stream endpoint). The store interface is isolated in `routers/tasks.py` so swapping it out requires no changes to agent code.

---

## Example tasks to try

- `Research the latest developments in MCP protocol and write a summary`
- `Write a Python script that calculates compound interest and explain how it works`
- `Compare LangGraph vs CrewAI for building multi-agent systems`
- `Research voice AI trends and analyze the key players`
- `Explain the architecture of transformer models with examples`

---

## Development

### Run tests

```bash
cd backend
pytest -v --cov=app
```

### Lint

```bash
cd backend
ruff check .
ruff format --check .
```

### Frontend build

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Project structure

```
langgraph-multi-agent/
├── .github/workflows/      # CI, Docker publish, GitHub Pages
├── backend/
│   ├── app/
│   │   ├── agents/         # LangGraph nodes (planner, researcher, executor, critic)
│   │   ├── routers/        # FastAPI routes (POST /tasks, GET /tasks/{id}/stream)
│   │   ├── tools/          # web_search, code_executor, file_writer
│   │   ├── config.py       # pydantic-settings
│   │   ├── models.py       # Pydantic schemas
│   │   └── main.py         # FastAPI app
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/     # AgentTimeline, AgentCard, OutputPanel, …
│       ├── hooks/          # useTaskStream (SSE), useTasks
│       └── api/client.js
├── docker-compose.yml
└── README.md
```

---

## License

MIT © 2024 plasmacat420
