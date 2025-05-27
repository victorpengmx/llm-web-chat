from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from chat import router as chat_router
from auth.auth import router as auth_router
from monitor import router as monitor_router

app = FastAPI()

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Then include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(chat_router)
app.include_router(monitor_router)

# Attach shared state
app.state.last_inference_time_ms = None

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
