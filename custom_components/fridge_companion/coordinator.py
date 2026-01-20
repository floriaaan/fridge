"""DataUpdateCoordinator for Fridge Companion."""
from datetime import timedelta
import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import FridgeCompanionApiClient
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class FridgeCompanionDataUpdateCoordinator(DataUpdateCoordinator[dict[str, list[dict]]]):
    """Class to manage fetching data from the API."""

    def __init__(self, hass: HomeAssistant, api_client: FridgeCompanionApiClient) -> None:
        """Initialize."""
        self.api_client = api_client
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=15),
        )

    async def _async_update_data(self) -> dict[str, list[dict]]:
        """Update data via library."""
        try:
            products = await self.api_client.get_products()
            shopping_items = await self.api_client.get_shopping_items()
            expired_products = await self.api_client.get_expired_products()
            expires_soon_products = await self.api_client.get_expires_soon_products()
            recipes = await self.api_client.get_recipes()
            statistics = await self.api_client.get_statistics_overview()
            return {
                "products": products,
                "shopping_items": shopping_items,
                "expired_products": expired_products,
                "expires_soon_products": expires_soon_products,
                "recipes": recipes,
                "statistics": statistics,
            }
        except Exception as exception:
            raise UpdateFailed(f"Error communicating with API: {exception}") from exception
