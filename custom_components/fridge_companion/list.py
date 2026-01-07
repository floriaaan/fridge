"""A list entity for the Fridge Companion recipes."""
from __future__ import annotations
from homeassistant.components.todo import (
    TodoItem,
    TodoItemStatus,
    TodoListEntity,
    TodoListEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN
from .coordinator import FridgeCompanionDataUpdateCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the list platform."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([RecipeListEntity(coordinator, entry)])


class RecipeListEntity(CoordinatorEntity[FridgeCompanionDataUpdateCoordinator], TodoListEntity):
    """A list of recipes."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: FridgeCompanionDataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the list."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_recipes"
        self._attr_name = "Recipes"
        self._attr_icon = "mdi:pot-steam"

    @property
    def todo_items(self) -> list[TodoItem] | None:
        """Return the recipes."""
        if self.coordinator.data is None or "recipes" not in self.coordinator.data:
            return None
        return [
            TodoItem(
                uid=recipe["id"],
                summary=recipe["title"],
                description=recipe["instructions"],
                status=TodoItemStatus.NEEDS_ACTION,
            )
            for recipe in self.coordinator.data["recipes"]
        ]

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Create a new recipe (not supported)."""
        pass

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Update a recipe (not supported)."""
        pass
