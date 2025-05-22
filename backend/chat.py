from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from typing import List

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

@router.post("/generate", response_model=ChatRecord)
def generate_text(prompt_request: PromptRequest):
    prompt = prompt_request.prompt
    outputs = llm.generate([prompt], sampling_params)
    response = outputs[0].outputs[0].text.strip()

    entry_id = str(uuid4())
    chat_history[entry_id] = {"prompt": prompt, "response": response}
    save_chat_history()

    return ChatRecord(id=entry_id, prompt=prompt, response=response)

@router.get("/history", response_model=List[ChatRecord])
def get_all_history():
    return [
        ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])
        for entry_id, record in chat_history.items()
    ]

@router.get("/history/{entry_id}", response_model=ChatRecord)
def get_entry(entry_id: str):
    if entry_id not in chat_history:
        raise HTTPException(status_code=404, detail="Entry not found.")
    record = chat_history[entry_id]
    return ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])

@router.delete("/history")
def delete_all():
    count = len(chat_history)
    chat_history.clear()
    save_chat_history()
    return {"message": f"Deleted all {count} entries."}

@router.delete("/history/{entry_id}")
def delete_entry(entry_id: str):
    if entry_id not in chat_history:
        raise HTTPException(status_code=404, detail="Entry not found.")
    deleted = chat_history.pop(entry_id)
    save_chat_history()
    return {"message": "Deleted successfully", "deleted": deleted}
