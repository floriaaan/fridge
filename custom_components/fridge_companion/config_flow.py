"""Config flow for Fridge Companion."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from .const import DOMAIN
from .api import FridgeCompanionApiClient
import aiohttp

class FridgeCompanionConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Fridge Companion."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            api_key = user_input["api_key"]
            base_url = user_input["base_url"]
            session = async_get_clientsession(self.hass)
            client = FridgeCompanionApiClient(api_key, session, base_url)

            try:
                if await client.async_test_connection():
                    return self.async_create_entry(title="Fridge Companion", data=user_input)
                else:
                    errors["base"] = "invalid_auth"
            except aiohttp.ClientError:
                errors["base"] = "cannot_connect"
            except Exception:
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("api_key"): str,
                vol.Required("base_url", default="http://localhost:3000"): str,
            }),
            errors=errors,
        )
