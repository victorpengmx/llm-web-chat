from vllm import AsyncLLMEngine, AsyncEngineArgs, SamplingParams
import config

engine_args = AsyncEngineArgs(
    model=config.MODEL_PATH,
    tensor_parallel_size=config.TENSOR_PARALLEL_SIZE,
    pipeline_parallel_size=config.PIPELINE_PARALLEL_SIZE,
    dtype="auto",
    trust_remote_code=True,
    quantization=config.QUANTIZATION,
    max_model_len=config.MAX_MODEL_LEN,
    block_size=config.BLOCK_SIZE,
    gpu_memory_utilization=config.GPU_MEMORY_UTILIZATION,
    enforce_eager=True,
)

llm = AsyncLLMEngine.from_engine_args(engine_args)

sampling_params = SamplingParams(
    temperature=config.TEMPERATURE,
    top_p=config.TOP_P,
    max_tokens=config.MAX_TOKENS
)

