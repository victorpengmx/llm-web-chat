import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
import time

from config import JWT_SECRET, JWT_ALGORITHM
from logger import logger

SECRET_KEY = JWT_SECRET
ALGORITHM = JWT_ALGORITHM

USERS_FILE = Path("storage/users.json")

# If users.json doesn't exist, create it with a default user
if not USERS_FILE.exists():
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)  # Create 'storage' folder if it does not exist
    default_users = {
        "user1": "test123"
    }
    with USERS_FILE.open("w", encoding="utf-8") as f:
        json.dump(default_users, f, indent=2)

# Load user info into memory
with USERS_FILE.open("r", encoding="utf-8") as f:
    users_db = json.load(f)

# Pydantic model for JWT response
class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter()

# Endpoint: POST /auth/token
# Validates username/password and returns a JWT token
@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password

    if username not in users_db or users_db[username] != password:
        logger.warning(f"[AUTH] Failed login attempt for username: {username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_data = {
        "sub": username,
        "iat": int(time.time())
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    logger.info(f"[AUTH] User '{username}' logged in successfully.")

    return {"access_token": token, "token_type": "bearer"}

# Extract and validate JWT from authorization header
def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            logger.warning(f"[AUTH] Token missing subject field.")
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        logger.warning("[AUTH] Invalid token used.")
        raise HTTPException(status_code=401, detail="Invalid token")
