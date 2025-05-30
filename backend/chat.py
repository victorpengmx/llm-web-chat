from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from functools import wraps
from logger import logger
from pydantic import BaseModel
from rate_limit import rate_limiter
from typing import List, Dict
from uuid import uuid4

import asyncio
import time

from auth.auth import get_current_user
from chat_storage import chat_history, save_chat_history
from model import llm, sampling_params
from monitor import router as monitor_router, track_latency

router = APIRouter()

# Pydantic models
class ChatRecord(BaseModel):
    id: str
    prompt: str
    response: str

class PromptRequest(BaseModel):
    prompt: str

class SessionPreview(BaseModel):
    id: str
    preview: str

# Calculates inference time for generating a response
def track_latency(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return await func(*args, **kwargs)
        finally:
            latency = time.perf_counter() - start
            print(f"[Latency] {func.__name__}: {latency:.4f}s")
    return wrapper


# Get all sessions for the current user
@router.get("/sessions", response_model=List[SessionPreview])
def list_sessions(user: str = Depends(get_current_user)):
    logger.info(f"[{user}] Requested session list.")
    sessions = chat_history.get(user, {})
    previews = []
    for session_id, entries in sessions.items():
        first_prompt = ""
        # Set preview text to first 20 characters of first prompt
        if entries:
            first_entry = next(iter(entries.values()))
            first_prompt = first_entry["prompt"][:20]
        previews.append(SessionPreview(id=session_id, preview=first_prompt))
    return previews

# Create a new session
@router.post("/sessions")
def create_session(user: str = Depends(get_current_user)):
    session_id = str(uuid4())
    if user not in chat_history:
        chat_history[user] = {}
    chat_history[user][session_id] = {}
    save_chat_history()
    logger.info(f"[{user}] Created new session: {session_id}")
    return {"session_id": session_id}

# Delete a session
@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user: str = Depends(get_current_user)):
    if user not in chat_history or session_id not in chat_history[user]:
        logger.warning(f"[{user}] Attempted to delete nonexistent session: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found.")
    del chat_history[user][session_id]
    save_chat_history()
    logger.info(f"[{user}] Deleted session: {session_id}")
    return {"message": "Session deleted."}

# Get full history from a specific session
@router.get("/sessions/{session_id}/history", response_model=List[ChatRecord])
def get_session_history(session_id: str, user: str = Depends(get_current_user)):
    user_sessions = chat_history.get(user, {})
    if session_id not in user_sessions:
        logger.warning(f"[{user}] Tried to access nonexistent session: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found.")
    logger.info(f"[{user}] Accessed history for session: {session_id}")
    session_entries = user_sessions[session_id]
    return [
        ChatRecord(id=entry_id, prompt=entry["prompt"], response=entry["response"])
        for entry_id, entry in session_entries.items()
    ]

# Generate and stream response to frontend
# Save complete response to user's session history
# Keep track of time taken to generate response
@router.post("/generate/stream/{session_id}")
async def generate_text_stream(
    session_id: str,
    prompt_request: PromptRequest,
    request: Request,
    user: str = Depends(get_current_user),
    rate_limiter_dep = Depends(rate_limiter)
):
    prompt = prompt_request.prompt
    entry_id = str(uuid4())
    request_id = str(time.time()) # For tracking generation latency

    if user not in chat_history or session_id not in chat_history[user]:
        logger.warning(f"[{user}] Tried to generate text for invalid session: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found.")

    logger.info(f"[{user}] Generating response for session {session_id} with prompt: {prompt[:30]}...")

    # Streams generated tokens one by one to frontend
    # Saves complete response to memory
    async def token_stream():
        start_time = time.perf_counter()
        results_generator = llm.generate(prompt, sampling_params, request_id=request_id)


        previous_text = ""
        full_response = ""
        token_count = 0

        async for request_output in results_generator:
            output = request_output.outputs[0]
            text = output.text
            delta = text[len(previous_text):]
            previous_text = text
            full_response = text

            # Count tokens from token_ids (if available)
            token_count = len(output.token_ids)

            yield delta

        end_time = time.perf_counter()
        inference_time_ms = round((end_time - start_time) * 1000)
        request.app.state.last_inference_time_ms = inference_time_ms
        request.app.state.last_token_count = token_count  # Expose to test client

        logger.info(f"[{user}] Inference took {inference_time_ms} ms for session {session_id}")
        logger.info(f"[{user}] Token count: {token_count}")

        chat_history[user][session_id][entry_id] = {
            "prompt": prompt,
            "response": full_response.strip()
        }
        save_chat_history()


    return StreamingResponse(token_stream(), media_type="text/plain")

@router.get("/generate/stats")
async def get_last_generation_stats(request: Request):
    return {
        "inference_time_ms": getattr(request.app.state, "last_inference_time_ms", None),
        "token_count": getattr(request.app.state, "last_token_count", None)
    }

