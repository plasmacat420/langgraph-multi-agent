import httpx


async def web_search(query: str, max_results: int = 4) -> list[dict]:
    """DuckDuckGo search returning list of {title, url, snippet}."""
    url = "https://api.duckduckgo.com/"
    params = {
        "q": query,
        "format": "json",
        "no_html": "1",
        "skip_disambig": "1",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception:
        return []

    results: list[dict] = []

    # Abstract result (direct answer)
    if data.get("AbstractText"):
        results.append(
            {
                "title": data.get("Heading", "Direct Answer"),
                "url": data.get("AbstractURL", ""),
                "snippet": data["AbstractText"][:300],
            }
        )

    # Related topics
    for topic in data.get("RelatedTopics", []):
        if len(results) >= max_results:
            break
        # Some topics are nested groups
        if "Topics" in topic:
            for subtopic in topic["Topics"]:
                if len(results) >= max_results:
                    break
                text = subtopic.get("Text", "")
                result_url = subtopic.get("FirstURL", "")
                if text:
                    results.append(
                        {
                            "title": text[:80],
                            "url": result_url,
                            "snippet": text[:300],
                        }
                    )
        else:
            text = topic.get("Text", "")
            result_url = topic.get("FirstURL", "")
            if text:
                results.append(
                    {
                        "title": text[:80],
                        "url": result_url,
                        "snippet": text[:300],
                    }
                )

    return results[:max_results]
