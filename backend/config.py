from dotenv import load_dotenv
import os

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

RATE_LIMIT = int(os.getenv("RATE_LIMIT", 2))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", 60))

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
