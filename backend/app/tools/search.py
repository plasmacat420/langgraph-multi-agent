import asyncio

from duckduckgo_search import DDGS


async def web_search(query: str, max_results: int = 4) -> list[dict]:
    """DuckDuckGo web search returning list of {title, url, snippet}."""
    try:
        # DDGS is sync — run in a thread so we don't block the event loop
        def _search():
            with DDGS() as ddgs:
                return list(ddgs.text(query, max_results=max_results))

        results = await asyncio.get_event_loop().run_in_executor(None, _search)

        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            }
            for r in results
            if r.get("body")
        ]
    except Exception:
        return []
