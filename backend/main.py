from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from chat import router as chat_router
from auth.auth import router as auth_router
from monitor import router as monitor_router
from logger import logger
from config import FRONTEND_ORIGIN

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(chat_router)
app.include_router(monitor_router)

# Shared application state to store timestamp of last inference request
app.state.last_inference_time_ms = None

# Log startup
@app.on_event("startup")
async def on_startup():
    logger.info("FastAPI application is starting up.")

# Log shutdown
@app.on_event("shutdown")
async def on_shutdown():
    logger.info("FastAPI application is shutting down.")

if __name__ == "__main__":
    logger.info("Starting uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
