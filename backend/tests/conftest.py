import os

import pytest

# Set dummy key so pydantic-settings doesn't complain
os.environ.setdefault("GROQ_API_KEY", "gsk-test-dummy-key")


@pytest.fixture
def sample_state():
    return {
        "task": "Research and summarize the latest AI trends",
        "plan": [
            "Identify key AI trends in 2024",
            "Gather information on large language models",
            "Summarize findings",
        ],
        "research": "AI is advancing rapidly with LLMs, multimodal models, and agents.",
        "draft": "",
        "critique": "",
        "final_output": "",
        "messages": [],
        "current_agent": "",
        "iterations": 0,
        "events": [],
        "status": "running",
    }
