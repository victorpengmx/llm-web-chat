import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
import time

SECRET_KEY = "supersecretkey"  # Replace with env var in production
ALGORITHM = "HS256"

USERS_FILE = Path("storage/users.json")

# If users.json doesn't exist, create it with a default user
if not USERS_FILE.exists():
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)  # Ensure 'storage' folder exists
    default_users = {
        "user1": "test123"
    }
    with USERS_FILE.open("w", encoding="utf-8") as f:
        json.dump(default_users, f, indent=2)

# Load users from JSON file
with USERS_FILE.open("r", encoding="utf-8") as f:
    users_db = json.load(f)

class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
router = APIRouter()

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password

    if username not in users_db or users_db[username] != password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_data = {
        "sub": username,
        "iat": int(time.time())
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
