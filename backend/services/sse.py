"""SSE notification hub — decouples webhook processing from router layer."""

import asyncio

_sse_queues: dict[str, list[asyncio.Queue]] = {}


def register_listener(conversation_id: str) -> asyncio.Queue:
    """Register a new SSE listener for a conversation. Returns the queue to await."""
    queue: asyncio.Queue = asyncio.Queue()
    _sse_queues.setdefault(conversation_id, []).append(queue)
    return queue


def unregister_listener(conversation_id: str, queue: asyncio.Queue) -> None:
    """Remove a listener queue (called on client disconnect)."""
    listeners = _sse_queues.get(conversation_id, [])
    if queue in listeners:
        listeners.remove(queue)


def notify_summary_ready(conversation_id: str) -> None:
    """Push a summarized event to all SSE listeners for a conversation."""
    for q in _sse_queues.pop(conversation_id, []):
        q.put_nowait({"status": "summarized"})
