import os
import json
from typing import Dict

# Path to chat history JSON
CHAT_HISTORY_FILE = "storage/chat_history.json"

# Ensure storage directory exists
os.makedirs(os.path.dirname(CHAT_HISTORY_FILE), exist_ok=True)

# In-memory store for chat history
chat_history: Dict[str, Dict[str, str]] = {}

# Load existing chat history from file if it exists
def load_chat_history() -> Dict[str, Dict[str, str]]:
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r") as f:
            return json.load(f)
    return {}

# Save chat history to file
def save_chat_history():
    with open(CHAT_HISTORY_FILE, "w") as f:
        json.dump(chat_history, f, indent=2)

# Load data into memory at module import
chat_history.update(load_chat_history())
