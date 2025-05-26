import time
from collections import defaultdict
from fastapi import Depends, HTTPException
from starlette.status import HTTP_429_TOO_MANY_REQUESTS

from auth.auth import get_current_user

# Store request timestamps per user
request_log = defaultdict(list)

# Rate limit config
RATE_LIMIT = 2
RATE_WINDOW = 60  # seconds

def rate_limiter(user: str = Depends(get_current_user)):
    now = time.time()
    window_start = now - RATE_WINDOW

    # Clean up old timestamps
    recent_requests = [
        timestamp for timestamp in request_log[user] if timestamp > window_start
    ]
    request_log[user] = recent_requests

    if len(recent_requests) >= RATE_LIMIT:
        raise HTTPException(
            status_code=HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later."
        )

    request_log[user].append(now)
