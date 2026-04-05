import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import settings
from app.routers.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("outputs", exist_ok=True)
    logger.info("LangGraph Multi-Agent Orchestrator starting up")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="LangGraph Multi-Agent Orchestrator",
    description="Multi-agent AI system with real-time streaming",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": "0.1.0"}
