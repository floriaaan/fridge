"""The Fridge Companion integration."""
from pathlib import Path
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.yaml import load_yaml
from .const import DOMAIN
from .api import FridgeCompanionApiClient
from .coordinator import FridgeCompanionDataUpdateCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Fridge Companion from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    session = async_get_clientsession(hass)
    api_client = FridgeCompanionApiClient(
        entry.data["api_key"], session, entry.data["base_url"]
    )

    coordinator = FridgeCompanionDataUpdateCoordinator(hass, api_client)
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(
        entry, ["todo", "sensor", "list"]
    )

    async def async_handle_generate_recipes(call: ServiceCall) -> None:
        """Handle the service call to generate recipes."""
        params = {
            "cuisine": call.data.get("cuisine"),
            "difficulty": call.data.get("difficulty"),
            "max_time": call.data.get("max_time"),
            "servings": call.data.get("servings"),
        }
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        await coordinator.api_client.async_generate_recipes(params)
        await coordinator.async_refresh()

    hass.services.async_register(
        DOMAIN, "generate_recipes", async_handle_generate_recipes
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, ["todo", "sensor", "list"]
    )
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
        hass.services.async_remove(DOMAIN, "generate_recipes")

    return unload_ok
