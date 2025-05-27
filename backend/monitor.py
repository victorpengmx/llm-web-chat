from fastapi import APIRouter, Request
import threading
import time
import psutil

router = APIRouter()
last_inference_time_ms = None

# GPU tracking setup
try:
    import pynvml
    pynvml.nvmlInit()
    has_gpu = True
    num_gpus = pynvml.nvmlDeviceGetCount()
    gpu_handles = [pynvml.nvmlDeviceGetHandleByIndex(i) for i in range(num_gpus)]
except Exception:
    has_gpu = False
    gpu_handles = []

latest_gpu_utilizations = []  # List of per-GPU utilization

# Background thread to sample GPU utilization
def gpu_utilization_tracker():
    global latest_gpu_utilizations
    while True:
        try:
            latest_gpu_utilizations = []
            for handle in gpu_handles:
                util = pynvml.nvmlDeviceGetUtilizationRates(handle)
                latest_gpu_utilizations.append(util.gpu)
        except Exception as e:
            print(f"[WARN] GPU tracker error: {e}")
            latest_gpu_utilizations = [-1] * len(gpu_handles)
        time.sleep(1)

@router.on_event("startup")
def start_gpu_monitor():
    if has_gpu:
        thread = threading.Thread(target=gpu_utilization_tracker, daemon=True)
        thread.start()
        print("[INFO] Multi-GPU utilization monitor started")

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

@router.get("/metrics")
def get_metrics(request: Request):
    gpu_data = []
    if has_gpu:
        for i, handle in enumerate(gpu_handles):
            try:
                mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
                name = pynvml.nvmlDeviceGetName(handle).decode("utf-8")

                gpu_data.append({
                    "index": i+1,
                    "name": name,
                    "utilization": latest_gpu_utilizations[i] if i < len(latest_gpu_utilizations) else -1,
                    "memory_used": mem_info.used // (1024 ** 2),
                    "memory_total": mem_info.total // (1024 ** 2),
                })
            except Exception as e:
                gpu_data.append({
                    "index": i,
                    "name": "Unknown",
                    "utilization": -1,
                    "memory_used": -1,
                    "memory_total": -1,
                })

    memory = psutil.virtual_memory()
    return {
        "gpus": gpu_data,
        "memory": {
            "used": memory.used // (1024 ** 2),
            "total": memory.total // (1024 ** 2),
        },
        "inference_time_ms": request.app.state.last_inference_time_ms,
    }
