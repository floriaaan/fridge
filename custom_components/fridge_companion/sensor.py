"""Sensor platform for Fridge Companion."""
from typing import Any, Dict

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import FridgeCompanionDataUpdateCoordinator


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the sensor platform."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    sensors = [
        ExpiredProductsSensor(coordinator, entry),
        ExpiresSoonProductsSensor(coordinator, entry),
        ExpiredProductsListSensor(coordinator, entry),
        ExpiresSoonProductsListSensor(coordinator, entry),
    ]
    async_add_entities(sensors, True)


class FridgeCompanionSensor(CoordinatorEntity[FridgeCompanionDataUpdateCoordinator], SensorEntity):
    """Base class for Fridge Companion sensors."""

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_{self.entity_description.key}"

    @property
    def device_info(self) -> Dict[str, Any]:
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self.coordinator.config_entry.entry_id)},
            "name": "Fridge Companion",
            "manufacturer": "Fridge Companion",
        }


class ExpiredProductsSensor(FridgeCompanionSensor):
    """Sensor for expired products count."""

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        self.entity_description = SensorEntityDescription(
            key="expired_products",
            name="Expired Products",
            icon="mdi:food-off",
        )
        super().__init__(coordinator, entry)

    @property
    def native_value(self) -> int:
        """Return the state of the sensor."""
        return len(self.coordinator.data.get("expired_products", []))


class ExpiresSoonProductsSensor(FridgeCompanionSensor):
    """Sensor for products expiring soon count."""

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        self.entity_description = SensorEntityDescription(
            key="expires_soon_products",
            name="Expires Soon Products",
            icon="mdi:food-alert",
        )
        super().__init__(coordinator, entry)

    @property
    def native_value(self) -> int:
        """Return the state of the sensor."""
        return len(self.coordinator.data.get("expires_soon_products", []))


class ExpiredProductsListSensor(FridgeCompanionSensor):
    """Sensor for expired products list."""

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        self.entity_description = SensorEntityDescription(
            key="expired_products_list",
            name="Expired Products List",
            icon="mdi:format-list-bulleted",
        )
        super().__init__(coordinator, entry)

    @property
    def native_value(self) -> int:
        """Return the state of the sensor."""
        return len(self.coordinator.data.get("expired_products", []))

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        products = self.coordinator.data.get("expired_products", [])
        return {"products": [product["name"] for product in products]}


class ExpiresSoonProductsListSensor(FridgeCompanionSensor):
    """Sensor for products expiring soon list."""

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        self.entity_description = SensorEntityDescription(
            key="expires_soon_products_list",
            name="Expires Soon Products List",
            icon="mdi:format-list-bulleted",
        )
        super().__init__(coordinator, entry)

    @property
    def native_value(self) -> int:
        """Return the state of the sensor."""
        return len(self.coordinator.data.get("expires_soon_products", []))

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        products = self.coordinator.data.get("expires_soon_products", [])
        return {"products": [product["name"] for product in products]}
