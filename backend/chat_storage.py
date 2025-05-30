import os
import json
import threading
from typing import Dict

# Path to chat history JSON
CHAT_HISTORY_FILE = "storage/chat_history.json"

# Ensure storage directory exists
os.makedirs(os.path.dirname(CHAT_HISTORY_FILE), exist_ok=True)

# In-memory store for chat history
# Structure: { user_id: { session_id: { entry_id: {prompt, response} } } }
chat_history: Dict[str, Dict[str, Dict[str, Dict[str, str]]]] = {}

# Lock to ensure thread-safe access
chat_history_lock = threading.Lock()

# Load existing chat history from file if it exists
def load_chat_history() -> Dict[str, Dict[str, Dict[str, Dict[str, str]]]]:
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r") as f:
            return json.load(f)
    return {}

# Save chat history to file safely
def save_chat_history():
    with chat_history_lock:
        # Make a deep copy to avoid concurrency issues while writing
        data_copy = json.loads(json.dumps(chat_history))  # JSON-safe deepcopy
        with open(CHAT_HISTORY_FILE, "w") as f:
            json.dump(data_copy, f, indent=2)

# Load data into memory at module import
with chat_history_lock:
    chat_history.update(load_chat_history())
