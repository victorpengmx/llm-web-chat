# backend/logger.py
import logging
from pathlib import Path

# Create a logs directory if it doesn't exist
Path("logs").mkdir(exist_ok=True)

logger = logging.getLogger("chat-service")
logger.setLevel(logging.INFO)

formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s")

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# File handler
file_handler = logging.FileHandler("logs/server.log", encoding="utf-8")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
