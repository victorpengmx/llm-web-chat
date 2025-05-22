# from fastapi import FastAPI
# from pydantic import BaseModel
# from vllm import LLM, SamplingParams

# app = FastAPI()

# class PromptRequest(BaseModel):
#     prompt: str

# # Shared objects (loaded at startup)
# llm = None
# sampling_params = SamplingParams(
#     temperature=0.6,
#     top_p=0.95,
#     max_tokens=512
# )

# @app.on_event("startup")
# async def startup_event():
#     global llm
#     from vllm import LLM  # Delayed import for safety
#     llm = LLM(
#         model="/home/greaterheat/models/deepseek-r1-32b",
#         tensor_parallel_size=2,
#         pipeline_parallel_size=1,
#         dtype="auto",
#         trust_remote_code=True,
#         quantization="bitsandbytes",
#         max_model_len=8192,
#         block_size=16,
#         gpu_memory_utilization=0.70
#     )

# @app.post("/generate")
# async def generate_response(request: PromptRequest):
#     global llm, sampling_params
#     outputs = llm.generate([request.prompt], sampling_params)
#     generated_text = outputs[0].outputs[0].text.strip()
#     return {
#         "prompt": request.prompt,
#         "response": generated_text
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("llm_server:app", host="0.0.0.0", port=8001)

# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from uuid import uuid4
# from typing import List, Dict
# from vllm import LLM, SamplingParams
# import uvicorn

# # Initialize FastAPI
# app = FastAPI()

# # In-memory store for chat history
# chat_history: Dict[str, Dict[str, str]] = {}

# # Initialize the model once
# llm = LLM(
#     model="/home/greaterheat/models/deepseek-r1-32b",
#     tensor_parallel_size=2,
#     pipeline_parallel_size=1,
#     dtype="auto",
#     trust_remote_code=True,
#     quantization="bitsandbytes",
#     max_model_len=8192,
#     block_size=16,
#     gpu_memory_utilization=0.70
# )
# sampling_params = SamplingParams(
#     temperature=0.6,
#     top_p=0.95,
#     max_tokens=512
# )

# # Request and response schemas
# class PromptRequest(BaseModel):
#     prompt: str

# class ChatRecord(BaseModel):
#     id: str
#     prompt: str
#     response: str

# # POST /generate — submit a prompt and receive a response
# @app.post("/generate", response_model=ChatRecord)
# def generate_text(prompt_request: PromptRequest):
#     prompt = prompt_request.prompt
#     outputs = llm.generate([prompt], sampling_params)
#     response = outputs[0].outputs[0].text.strip()
    
#     entry_id = str(uuid4())
#     chat_history[entry_id] = {"prompt": prompt, "response": response}
    
#     return ChatRecord(id=entry_id, prompt=prompt, response=response)

# # GET /history — returns all prompt-response pairs
# @app.get("/history", response_model=List[ChatRecord])
# def get_all_history():
#     return [
#         ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])
#         for entry_id, record in chat_history.items()
#     ]

# # GET /history/{entry_id} — get specific prompt-response pair
# @app.get("/history/{entry_id}", response_model=ChatRecord)
# def get_entry(entry_id: str):
#     if entry_id not in chat_history:
#         raise HTTPException(status_code=404, detail="Entry not found.")
#     record = chat_history[entry_id]
#     return ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])

# # DELETE /history/{entry_id}
# @app.delete("/history/{entry_id}")
# def delete_entry(entry_id: str):
#     if entry_id not in chat_history:
#         raise HTTPException(status_code=404, detail="Entry not found.")
#     deleted = chat_history.pop(entry_id)
#     return {"message": "Deleted successfully", "deleted": deleted}

# # DELETE /history
# @app.delete("/history")
# def delete_all():
#     count = len(chat_history)
#     chat_history.clear()
#     return {"message": f"Deleted all {count} entries."}

# # Run with: python llm_server.py
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from typing import List, Dict
from vllm import LLM, SamplingParams
import uvicorn
import json
import os

# Initialize FastAPI
app = FastAPI()

# Path to chat history JSON
CHAT_HISTORY_FILE = "storage/chat_history.json"

# Ensure storage directory exists
os.makedirs(os.path.dirname(CHAT_HISTORY_FILE), exist_ok=True)

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

# In-memory store for chat history
chat_history: Dict[str, Dict[str, str]] = load_chat_history()

# Initialize the model once
llm = LLM(
    model="/home/greaterheat/models/deepseek-r1-32b",
    tensor_parallel_size=2,
    pipeline_parallel_size=1,
    dtype="auto",
    trust_remote_code=True,
    quantization="bitsandbytes",
    max_model_len=8192,
    block_size=16,
    gpu_memory_utilization=0.70
)

sampling_params = SamplingParams(
    temperature=0.6,
    top_p=0.95,
    max_tokens=512
)

# Request and response schemas
class PromptRequest(BaseModel):
    prompt: str

class ChatRecord(BaseModel):
    id: str
    prompt: str
    response: str

# POST /generate — submit a prompt and receive a response
@app.post("/generate", response_model=ChatRecord)
def generate_text(prompt_request: PromptRequest):
    prompt = prompt_request.prompt
    outputs = llm.generate([prompt], sampling_params)
    response = outputs[0].outputs[0].text.strip()

    entry_id = str(uuid4())
    chat_history[entry_id] = {"prompt": prompt, "response": response}
    save_chat_history()

    return ChatRecord(id=entry_id, prompt=prompt, response=response)

# GET /history — returns all prompt-response pairs
@app.get("/history", response_model=List[ChatRecord])
def get_all_history():
    return [
        ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])
        for entry_id, record in chat_history.items()
    ]

# GET /history/{entry_id} — get specific prompt-response pair
@app.get("/history/{entry_id}", response_model=ChatRecord)
def get_entry(entry_id: str):
    if entry_id not in chat_history:
        raise HTTPException(status_code=404, detail="Entry not found.")
    record = chat_history[entry_id]
    return ChatRecord(id=entry_id, prompt=record["prompt"], response=record["response"])

# DELETE /history/{entry_id}
@app.delete("/history/{entry_id}")
def delete_entry(entry_id: str):
    if entry_id not in chat_history:
        raise HTTPException(status_code=404, detail="Entry not found.")
    deleted = chat_history.pop(entry_id)
    save_chat_history()
    return {"message": "Deleted successfully", "deleted": deleted}

# DELETE /history
@app.delete("/history")
def delete_all():
    count = len(chat_history)
    chat_history.clear()
    save_chat_history()
    return {"message": f"Deleted all {count} entries."}

# Run with: python llm_server.py
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

