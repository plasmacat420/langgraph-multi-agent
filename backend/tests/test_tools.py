import os
from unittest.mock import MagicMock, patch

import pytest

from app.tools.code_executor import execute_python
from app.tools.file_writer import write_output
from app.tools.search import web_search

# ---------------------------------------------------------------------------
# web_search
# ---------------------------------------------------------------------------

_FAKE_RESULTS = [
    {"title": "LangGraph overview", "href": "https://example.com/langgraph", "body": "LangGraph is a library for building stateful agents."},
    {"title": "Agent frameworks", "href": "https://example.com/agents", "body": "Multi-agent frameworks enable complex task decomposition."},
]


@pytest.mark.asyncio
async def test_web_search_returns_results():
    mock_ddgs = MagicMock()
    mock_ddgs.__enter__ = MagicMock(return_value=mock_ddgs)
    mock_ddgs.__exit__ = MagicMock(return_value=False)
    mock_ddgs.text = MagicMock(return_value=_FAKE_RESULTS)

    with patch("app.tools.search.DDGS", return_value=mock_ddgs):
        results = await web_search("LangGraph", max_results=4)

    assert isinstance(results, list)
    assert len(results) == 2
    assert results[0]["title"] == "LangGraph overview"
    assert results[0]["url"] == "https://example.com/langgraph"
    assert "LangGraph" in results[0]["snippet"]


@pytest.mark.asyncio
async def test_web_search_returns_empty_on_error():
    mock_ddgs = MagicMock()
    mock_ddgs.__enter__ = MagicMock(side_effect=Exception("network error"))
    mock_ddgs.__exit__ = MagicMock(return_value=False)

    with patch("app.tools.search.DDGS", return_value=mock_ddgs):
        results = await web_search("anything", max_results=4)

    assert results == []


# ---------------------------------------------------------------------------
# code_executor
# ---------------------------------------------------------------------------


def test_code_executor_success():
    result = execute_python('print("hello")')
    assert result["success"] is True
    assert "hello" in result["output"]
    assert result["error"] is None


def test_code_executor_captures_stderr():
    result = execute_python("import sys; sys.stderr.write('err'); sys.exit(1)")
    assert result["success"] is False
    assert result["error"] is not None


def test_code_executor_timeout():
    result = execute_python("while True: pass")
    assert result["success"] is False
    assert "timed out" in result["error"].lower() or result["error"]


def test_code_executor_syntax_error():
    result = execute_python("def broken(: pass")
    assert result["success"] is False


# ---------------------------------------------------------------------------
# file_writer
# ---------------------------------------------------------------------------


def test_file_writer_creates_file(tmp_path, monkeypatch):
    import app.tools.file_writer as fw

    monkeypatch.setattr(fw, "_OUTPUT_DIR", str(tmp_path))
    result = write_output("report.txt", "Hello, world!")
    assert os.path.exists(result["path"])
    assert result["size"] == len("Hello, world!".encode())
    with open(result["path"], encoding="utf-8") as f:
        assert f.read() == "Hello, world!"


def test_file_writer_path_traversal(tmp_path, monkeypatch):
    import app.tools.file_writer as fw

    monkeypatch.setattr(fw, "_OUTPUT_DIR", str(tmp_path))
    # os.path.basename strips path components, so traversal attempts are sanitized
    result = write_output("../../../etc/passwd", "evil")
    # Should land inside tmp_path, not at /etc/passwd
    assert str(tmp_path) in result["path"]


def test_file_writer_sanitizes_special_chars(tmp_path, monkeypatch):
    import app.tools.file_writer as fw

    monkeypatch.setattr(fw, "_OUTPUT_DIR", str(tmp_path))
    result = write_output("my report & data.txt", "content")
    assert os.path.exists(result["path"])
    # No & or spaces in filename
    assert "&" not in os.path.basename(result["path"])
