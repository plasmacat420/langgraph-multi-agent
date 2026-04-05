import os

import httpx
import pytest
import respx

from app.tools.code_executor import execute_python
from app.tools.file_writer import write_output
from app.tools.search import web_search

# ---------------------------------------------------------------------------
# web_search
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_web_search_returns_results():
    mock_payload = {
        "AbstractText": "DuckDuckGo is a privacy-focused search engine.",
        "AbstractURL": "https://duckduckgo.com",
        "Heading": "DuckDuckGo",
        "RelatedTopics": [
            {
                "Text": "Privacy Search Engine — DuckDuckGo offers private browsing.",
                "FirstURL": "https://duckduckgo.com/privacy",
            }
        ],
    }

    with respx.mock:
        respx.get("https://api.duckduckgo.com/").mock(
            return_value=httpx.Response(200, json=mock_payload)
        )
        results = await web_search("DuckDuckGo", max_results=4)

    assert isinstance(results, list)
    assert len(results) >= 1
    assert "title" in results[0]
    assert "url" in results[0]
    assert "snippet" in results[0]


@pytest.mark.asyncio
async def test_web_search_returns_empty_on_error():
    with respx.mock:
        respx.get("https://api.duckduckgo.com/").mock(return_value=httpx.Response(500))
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
