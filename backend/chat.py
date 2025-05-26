from auth.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from uuid import uuid4
from typing import List

import asyncio
import time

from model import llm, sampling_params
from chat_storage import chat_history, save_chat_history

router = APIRouter()

# Pydantic models
class PromptRequest(BaseModel):
    prompt: str

class ChatRecord(BaseModel):
    id: str
    prompt: str
    response: str


@router.get("/history", response_model=List[ChatRecord])
def get_user_history(user: str = Depends(get_current_user)):
    entries = chat_history.get(user, {})
    return [
        ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])
        for entry_id, record in entries.items()
    ]


@router.get("/history/{entry_id}", response_model=ChatRecord)
def get_entry(entry_id: str, user: str = Depends(get_current_user)):
    user_entries = chat_history.get(user, {})
    if entry_id not in user_entries:
        raise HTTPException(status_code=404, detail="Entry not found.")
    record = user_entries[entry_id]
    return ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])


@router.delete("/history")
def delete_all(user: str = Depends(get_current_user)):
    count = len(chat_history.get(user, {}))
    chat_history[user] = {}
    save_chat_history()
    return {"message": f"Deleted all {count} entries."}


@router.delete("/history/{entry_id}")
def delete_entry(entry_id: str, user: str = Depends(get_current_user)):
    user_entries = chat_history.get(user, {})
    if entry_id not in user_entries:
        raise HTTPException(status_code=404, detail="Entry not found.")
    deleted = user_entries.pop(entry_id)
    save_chat_history()
    return {"message": "Deleted successfully", "deleted": deleted}


@router.post("/generate/stream")
async def generate_text_stream(prompt_request: PromptRequest, user: str = Depends(get_current_user)):
    prompt = prompt_request.prompt
    entry_id = str(uuid4())
    request_id = str(time.time())

    async def token_stream():
        results_generator = llm.generate(prompt, sampling_params, request_id=request_id)
        previous_text = ""
        full_response = ""

        async for request_output in results_generator:
            text = request_output.outputs[0].text
            delta = text[len(previous_text):]
            previous_text = text
            full_response = text
            yield delta

        # Save response per user
        if user not in chat_history:
            chat_history[user] = {}

        chat_history[user][entry_id] = {
            "prompt": prompt,
            "response": full_response.strip()
        }
        save_chat_history()

    return StreamingResponse(token_stream(), media_type="text/plain")
