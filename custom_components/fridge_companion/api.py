"""API client for Fridge Companion."""
from typing import Any, Dict, List
import aiohttp

class FridgeCompanionApiClient:
    """API client for Fridge Companion."""

    def __init__(self, api_key: str, session: aiohttp.ClientSession, base_url: str):
        """Initialize the API client."""
        self._api_key = api_key
        self._session = session
        self._base_url = base_url
        self._headers = {"Authorization": f"Bearer {self._api_key}"}

    async def async_test_connection(self) -> bool:
        """Test the connection to the API."""
        async with self._session.get(f"{self._base_url}/api/products", headers=self._headers) as response:
            return response.status == 200

    async def get_products(self) -> list:
        """Get the list of products."""
        async with self._session.get(f"{self._base_url}/api/products", headers=self._headers) as response:
            response.raise_for_status()
            data = await response.json()
            return data.get("data", [])

    async def async_create_item(self, name: str) -> None:
        """Create a new item."""
        product_data = {
            "name": name,
            "quantity": 1,
            "unit": "piece",
            "location": "fridge",
            "category": "unknown",
        }
        async with self._session.post(
            f"{self._base_url}/api/products", headers=self._headers, json=[product_data]
        ) as response:
            response.raise_for_status()

    async def async_update_item(self, item_id: str, name: str | None = None, quantity: int | None = None) -> None:
        """Update an item."""
        update_data: Dict[str, Any] = {"id": item_id}
        if name is not None:
            update_data["name"] = name
        if quantity is not None:
            update_data["quantity"] = quantity

        async with self._session.put(
            f"{self._base_url}/api/products", headers=self._headers, json=[update_data]
        ) as response:
            response.raise_for_status()

    async def async_delete_items(self, item_ids: List[str]) -> None:
        """Delete items in a batch."""
        async with self._session.delete(
            f"{self._base_url}/api/products",
            headers=self._headers,
            json=[{"id": item_id} for item_id in item_ids],
        ) as response:
            response.raise_for_status()
