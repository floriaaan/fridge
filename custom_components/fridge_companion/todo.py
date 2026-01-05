"""Todo platform for Fridge Companion."""
from typing import Any

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
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the todo platform."""
    coordinator: FridgeCompanionDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([FridgeCompanionTodoList(coordinator, entry.entry_id)])


class FridgeCompanionTodoList(CoordinatorEntity[FridgeCompanionDataUpdateCoordinator], TodoListEntity):
    """A todolist for Fridge Companion."""

    _attr_has_entity_name = True
    _attr_name = "Fridge Companion"
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
    )

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry_id: str
    ) -> None:
        """Initialize the todolist."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_todo_list"

    @property
    def todo_items(self) -> list[TodoItem] | None:
        """Return the todo items."""
        if self.coordinator.data is None:
            return None

        return [
            TodoItem(
                uid=item["id"],
                summary=item["name"],
                status=TodoItemStatus.COMPLETED if item["quantity"] == 0 else TodoItemStatus.NEEDS_ACTION,
            )
            for item in self.coordinator.data
        ]

    async def async_create_item(self, item: dict[str, Any]) -> None:
        """Create a new item."""
        await self.coordinator.api_client.async_create_item(item["summary"])
        await self.coordinator.async_refresh()

    async def async_update_item(self, item: dict[str, Any]) -> None:
        """Update an item."""
        item_id = item["uid"]
        name = item.get("summary")

        quantity = None
        if "status" in item:
            status = item["status"]
            if status == TodoItemStatus.COMPLETED:
                quantity = 0
            elif status == TodoItemStatus.NEEDS_ACTION:
                # Find the current quantity to determine if we should set it back to 1
                current_item = next((i for i in self.coordinator.data if i["id"] == item_id), None)
                if current_item and current_item["quantity"] == 0:
                    quantity = 1

        await self.coordinator.api_client.async_update_item(item_id, name, quantity)
        await self.coordinator.async_refresh()

    async def async_delete_items(self, uids: list[str]) -> None:
        """Delete items."""
        await self.coordinator.api_client.async_delete_items(uids)
        await self.coordinator.async_refresh()
