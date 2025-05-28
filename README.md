# LLM Web Chat App

This is a full-stack, locally-hosted ChatGPT-style application that integrates a quantized LLM (e.g., DeepSeek R1 32B) using `vLLM` for fast, streaming text generation. The app includes multi-session chat history, JWT-based user authentication, and a monitoring dashboard for system metrics (GPU, memory, inference time).

---

## Features

- FastAPI backend serving streaming responses via `vLLM`
- User login via JWT (JSON Web Tokens)
- Multi-session chat interface
- Real-time system monitor (GPU/memory usage, inference time)
- Works with local LLMs (INT8 quantized DeepSeek R1 32B)
- Frontend built with React + Vite + React-Bootstrap

---

## Technologies Used

### Backend
- Python 3.10+
- FastAPI
- vLLM
- python-dotenv
- python-jose
- uvicorn, pydantic, asyncio

### Frontend
- React
- Vite
- React-Bootstrap
- react-router-dom, fetch

---

## Requirements

This project **requires a local LLM** hosted using `vLLM`. It assumes:
- A model like `deepseek-r1-32b` is downloaded locally.
- A dual-GPU setup is available for tensor parallelism.
- The model runs via `vLLM.AsyncLLMEngine`.

---

## Installation & Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/victorpengmx/llm-web-chat.git
cd llm-web-chat
```

### 2. Set Up Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
```
Install the required dependencies. 

⚠️ This project assumes a working Python environment. 
If you encounter import errors, please install missing packages manually or regenerate `requirements.txt` with `pip freeze`.

```bash
pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Start the backend 

```bash
python main.py
```

### 3. Start the React Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open your web browser and visit http://localhost:5173 to access the application.

Login with the default username `user1` and password `test123`.

## API Documentation

The application provides the following API endpoints:

- `POST /auth/token`: Get JWT token (login)
- `GET /sessions`: List all chat sessions
- `POST /sessions`: Create a new chat session
- `DELETE /sessions/:session_id`: Delete a chat session
- `GET /sessions/:session_id/history`: Get the chat history of a chat session
- `POST /generate/stream/:session_id`: Stream chat completions
- `GET /metrics`: Return system usage stats (GPU utilization, memory, inference time)

## Frontend Component Overview

ChatPage.jsx: Manages chat session and chat prompts and responses.

ChatInput.jsx: Input box for prompt submission.

MessagePair.jsx: Display box for a prompt and response pair.

Sidebar.jsx: Shows sessions and allows switching/deleting.

Login.jsx: Login form and token storage.

Monitor.jsx: Fetches and displays metrics from backend.

## Configuration

The application provides configuration options that can be cutomized. These options can be modified by updating the environment variables in the `.env` files.

Authentication & Security

- `JWT_SECRET`: Secret key used to sign JWT tokens.
- `JWT_ALGORITHM`: The algorithm used for signing JWT tokens.

Rate Limiting

- `RATE_LIMIT`: Maximum number of allowed requests within the rate window.
- `RATE_WINDOW`: Time window (in seconds) for the rate limit.

Frontend/Backend Communication

- `FRONTEND_ORIGIN`: URL of the frontend app allowed to access the backend (CORS origin).
- `VITE_BACKEND_URL`: The base URL of the backend API (used in the frontend via Vite).

Model Configuration

- `MODEL_PATH`: Filesystem path to the locally stored LLM model.
- `TENSOR_PARALLEL_SIZE`: Number of GPUs to use for tensor parallelism.
- `PIPELINE_PARALLEL_SIZE`: Number of stages in pipeline parallelism.
- `QUANTIZATION`: Quantization method used for the model (e.g., bitsandbytes).

Model Memory & Performance

- `MAX_MODEL_LEN`: Maximum sequence length supported by the model.
- `BLOCK_SIZE`: Block size for memory-efficient attention.
- `GPU_MEMORY_UTILIZATION`: Fraction of GPU memory to allocate for inference.

Inference Sampling

- `TEMPERATURE`: Controls randomness in generation (higher = more random).
- `TOP_P`: Top-p (nucleus) sampling threshold.
- `MAX_TOKENS`: Maximum number of tokens to generate in a single response.

Use `.env.example` as a template for both frontend and backend.
