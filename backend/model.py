from vllm import AsyncLLMEngine, AsyncEngineArgs, SamplingParams

engine_args = AsyncEngineArgs(
    model="/home/greaterheat/models/deepseek-r1-32b",
    tensor_parallel_size=2,
    pipeline_parallel_size=1,
    dtype="auto",
    trust_remote_code=True,
    quantization="bitsandbytes",
    max_model_len=8192,
    block_size=16,
    gpu_memory_utilization=0.70,
    enforce_eager=True,  # important for streaming
)

llm = AsyncLLMEngine.from_engine_args(engine_args)

sampling_params = SamplingParams(
    temperature=0.6,
    top_p=0.95,
    max_tokens=512
)

