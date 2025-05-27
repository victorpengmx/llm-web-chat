from fastapi import APIRouter, Request
from functools import wraps
import threading
import time
import psutil

router = APIRouter()
last_inference_time_ms = None  # Global variable to store last latency

# GPU tracking setup
try:
    import pynvml
    pynvml.nvmlInit()
    has_gpu = True
    gpu_handle = pynvml.nvmlDeviceGetHandleByIndex(0)
except Exception:
    has_gpu = False
    gpu_handle = None

latest_gpu_utilization = 0  # Global utilization value

# Background thread to sample GPU utilization every second
def gpu_utilization_tracker():
    global latest_gpu_utilization
    while True:
        try:
            util = pynvml.nvmlDeviceGetUtilizationRates(gpu_handle)
            latest_gpu_utilization = util.gpu
        except Exception as e:
            print(f"[WARN] GPU tracker error: {e}")
            latest_gpu_utilization = -1
        time.sleep(1)

@router.on_event("startup")
def start_gpu_monitor():
    if has_gpu:
        thread = threading.Thread(target=gpu_utilization_tracker, daemon=True)
        thread.start()
        print("[INFO] GPU utilization monitor started")

# Inference latency tracker
def set_inference_time(ms: float):
    global last_inference_time_ms
    last_inference_time_ms = ms

def track_latency(route_func):
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get("request")
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

        start_time = time.time()
        result = await route_func(*args, **kwargs)
        end_time = time.time()

        latency_ms = (end_time - start_time) * 1000
        print(f"Inference latency: {latency_ms:.2f} ms")

        if request:
            request.app.state.last_inference_time_ms = latency_ms

        return result
    return wrapper

# Metrics route
@router.get("/metrics")
def get_metrics(request: Request):
    gpu_data = None
    if has_gpu:
        try:
            mem_info = pynvml.nvmlDeviceGetMemoryInfo(gpu_handle)
            name = pynvml.nvmlDeviceGetName(gpu_handle).decode("utf-8")

            gpu_data = {
                "name": name,
                "utilization": latest_gpu_utilization,
                "memory_used": mem_info.used // (1024 ** 2),
                "memory_total": mem_info.total // (1024 ** 2),
            }
        except Exception:
            gpu_data = None

    memory = psutil.virtual_memory()
    return {
        "gpu": gpu_data,
        "memory": {
            "used": memory.used // (1024 ** 2),
            "total": memory.total // (1024 ** 2),
        },
        "inference_time_ms": request.app.state.last_inference_time_ms,
    }
