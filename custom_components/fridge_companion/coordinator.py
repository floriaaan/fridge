"""DataUpdateCoordinator for Fridge Companion."""
from datetime import timedelta
import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import FridgeCompanionApiClient
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class FridgeCompanionDataUpdateCoordinator(DataUpdateCoordinator[list[dict]]):
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

    async def _async_update_data(self) -> list[dict]:
        """Update data via library."""
        try:
            return await self.api_client.get_products()
        except Exception as exception:
            raise UpdateFailed(f"Error communicating with API: {exception}") from exception
