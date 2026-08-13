import os
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

ANAKIN_API_BASE = "https://api.anakin.io/v1"

class AnakinAgenticClient:
    """
    Client for Anakin.io Agentic AI Search & Research Engine.
    Used for live vulnerability research, CVE matching, and deep architectural web search.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("ANAKIN_API_KEY", "")

    async def search_vulnerability_cve(self, query: str) -> Dict[str, Any]:
        """
        Submits an agentic search query to Anakin.io for real-time security & architectural intelligence.
        """
        if not self.api_key:
            return {
                "success": False,
                "detail": "No Anakin.io API Key provided. Local AST & Neural ML Ensemble used."
            }

        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "query": f"Code security vulnerabilities best practices and CVEs for: {query}",
            "options": {
                "depth": "comprehensive",
                "include_sources": True
            }
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{ANAKIN_API_BASE}/agentic-search", json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "success": True,
                        "report": data.get("report") or data.get("result") or "Research completed",
                        "sources": data.get("sources", [])
                    }
                else:
                    return {
                        "success": False,
                        "status_code": res.status_code,
                        "detail": f"Anakin.io API error: {res.text}"
                    }
        except Exception as e:
            logger.warning(f"Anakin API request failed: {e}")
            return {
                "success": False,
                "detail": str(e)
            }
