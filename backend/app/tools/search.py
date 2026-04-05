import asyncio

from tavily import TavilyClient

from app.config import settings


async def web_search(query: str, max_results: int = 4) -> list[dict]:
    """Tavily web search returning list of {title, url, snippet}."""
    if not settings.TAVILY_API_KEY:
        return []

    def _search():
        client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        response = client.search(query, max_results=max_results, search_depth="basic")
        return response.get("results", [])

    try:
        results = await asyncio.get_event_loop().run_in_executor(None, _search)
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": r.get("content", ""),
            }
            for r in results
            if r.get("content")
        ]
    except Exception:
        return []
