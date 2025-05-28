from dotenv import load_dotenv
import os

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

RATE_LIMIT = int(os.getenv("RATE_LIMIT", 2))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", 60))

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

MODEL_PATH = os.getenv("MODEL_PATH", "/default/model/path")
TENSOR_PARALLEL_SIZE = int(os.getenv("TENSOR_PARALLEL_SIZE", 1))
PIPELINE_PARALLEL_SIZE = int(os.getenv("PIPELINE_PARALLEL_SIZE", 1))
QUANTIZATION = os.getenv("QUANTIZATION", "bitsandbytes")
MAX_MODEL_LEN = int(os.getenv("MAX_MODEL_LEN", 8192))
BLOCK_SIZE = int(os.getenv("BLOCK_SIZE", 16))
GPU_MEMORY_UTILIZATION = float(os.getenv("GPU_MEMORY_UTILIZATION", 0.7))

TEMPERATURE = float(os.getenv("TEMPERATURE", 0.6))
TOP_P = float(os.getenv("TOP_P", 0.95))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", 512))
