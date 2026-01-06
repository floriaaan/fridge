"""Todo platform for Fridge Companion."""
from datetime import datetime
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

from .const import DOMAIN, ENTITY_NAME_FRIDGE_CONTENT, ENTITY_NAME_SHOPPING_LIST
from .coordinator import FridgeCompanionDataUpdateCoordinator


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the todo platform."""
    coordinator: FridgeCompanionDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        FridgeCompanionTodoList(coordinator, entry.entry_id),
        FridgeCompanionShoppingListToDoEntity(coordinator, entry.entry_id),
    ])

class FridgeCompanionTodoList(CoordinatorEntity[FridgeCompanionDataUpdateCoordinator], TodoListEntity):
    """A todolist for Fridge Companion."""

    _attr_has_entity_name = True
    _attr_name = ENTITY_NAME_FRIDGE_CONTENT
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

        def format_description(item: dict) -> str:
            """Format a pretty description for the item."""
            parts = []
            
            # Quantity
            quantity = item.get('quantity', 0)
            unit = item.get('unit', '')
            if quantity and unit:
                parts.append(f"{quantity} {unit}")
            elif quantity:
                parts.append(f"Qty: {quantity}")
            
            
            
            # Expires at
            expires_at = item.get('expiresAt')
            if expires_at and expires_at != 'unknown':
                try:
                    date_obj = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                    parts.append(f"Expires: {date_obj.strftime('%b %d, %Y')}")
                except (ValueError, AttributeError):
                    parts.append(f"Expires: {expires_at}")
            
            # Opened at
            opened_at = item.get('openedAt')
            if opened_at and opened_at != 'unknown':
                try:
                    date_obj = datetime.fromisoformat(opened_at.replace('Z', '+00:00'))
                    parts.append(f"Opened: {date_obj.strftime('%b %d, %Y')}")
                except (ValueError, AttributeError):
                    parts.append(f"Opened: {opened_at}")

            # Location
            location = item.get('location')
            if location and location != 'unknown':
                parts.append(f"Location: {location}")
            
            return " • ".join(parts) if parts else "No details available"

        return [
            TodoItem(
                uid=item["id"],
                summary=item["name"],
                status=TodoItemStatus.COMPLETED if item["quantity"] == 0 else TodoItemStatus.NEEDS_ACTION,
                description=format_description(item)
            )
            for item in self.coordinator.data.get("products", [])
        ]

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Create a new item."""
        await self.coordinator.api_client.async_create_item(item.summary)
        await self.coordinator.async_refresh()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Update an item."""
        item_id = item.uid
        name = item.summary

        quantity = None
        if item.status:
            status = item.status
            if status == TodoItemStatus.COMPLETED:
                quantity = 0
            elif status == TodoItemStatus.NEEDS_ACTION:
                # Find the current quantity to determine if we should set it back to 1
                current_item = next((i for i in self.coordinator.data.get("products", []) if i["id"] == item_id), None)
                if current_item and current_item["quantity"] == 0:
                    quantity = 1

        await self.coordinator.api_client.async_update_item(item_id, name, quantity)
        await self.coordinator.async_refresh()

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Delete items."""
        await self.coordinator.api_client.async_delete_items(uids)
        await self.coordinator.async_refresh()


class FridgeCompanionShoppingListToDoEntity(CoordinatorEntity[FridgeCompanionDataUpdateCoordinator], TodoListEntity):
    """A todolist for the shopping list in Fridge Companion."""

    _attr_has_entity_name = True
    _attr_name = ENTITY_NAME_SHOPPING_LIST
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
    )

    def __init__(
        self, coordinator: FridgeCompanionDataUpdateCoordinator, entry_id: str
    ) -> None:
        """Initialize the shopping list."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_shopping_list"

    @property
    def todo_items(self) -> list[TodoItem] | None:
        """Return the shopping list items."""
        if self.coordinator.data is None:
            return None

        def format_shopping_description(item: dict) -> str:
            """Format a pretty description for the shopping item."""
            parts = []
            
            # Quantity
            quantity = item.get('quantity', 0)
            unit = item.get('unit', '')
            if quantity and unit:
                parts.append(f"{quantity} {unit}")
            elif quantity:
                parts.append(f"Qty: {quantity}")
            
            # Source
            source = item.get('source')
            if source and source != 'unknown':
                parts.append(f"Added by: {source}")
            
            return " • ".join(parts) if parts else "No details available"

        return [
            TodoItem(
                uid=item["id"],
                summary=item["name"],
                status=TodoItemStatus.COMPLETED if item["checked"] else TodoItemStatus.NEEDS_ACTION,
                description=format_shopping_description(item)
            )
            for item in self.coordinator.data.get("shopping_items", [])
        ]

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Create a new shopping item."""
        await self.coordinator.api_client.async_create_shopping_item(item.summary)
        await self.coordinator.async_refresh()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Update a shopping item."""
        item_id = item.uid
        name = item.summary
        checked = None
        if item.status:
            checked = item.status == TodoItemStatus.COMPLETED

        await self.coordinator.api_client.async_update_shopping_item(item_id, name, checked)
        await self.coordinator.async_refresh()

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Delete shopping items."""
        await self.coordinator.api_client.async_delete_shopping_items(uids)
        await self.coordinator.async_refresh()
