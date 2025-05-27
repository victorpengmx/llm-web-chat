import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Monitor = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        const res = await fetch("http://localhost:8000/metrics");
        if (!res.ok) throw new Error("Failed to fetch monitor data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMonitorData();
    const interval = setInterval(fetchMonitorData, 2000); // Refresh every 2s
    return () => clearInterval(interval);
  }, []);

  const { gpus = [], memory, inference_time_ms } = data || {};

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Chat
        </button>
      </div>

      <h1 className="text-xl font-semibold mb-4">Monitoring Dashboard</h1>

      {error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : !data ? (
        <div className="text-gray-600">Loading monitoring data...</div>
      ) : (
        <>
          {gpus.length > 0 ? (
            <div className="mb-4">
              <h2 className="font-medium text-gray-700 mb-2">GPUs</h2>
              {gpus.map((gpu) => (
                <div key={gpu.index} className="mb-2 border p-3 rounded bg-gray-50 shadow">
                  <p className="font-semibold">GPU {gpu.index}: {gpu.name}</p>
                  <p>Utilization: {gpu.utilization}%</p>
                  <p>
                    Memory Used: {gpu.memory_used} MB / {gpu.memory_total} MB
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">GPU data not available.</p>
          )}

          {memory ? (
            <div className="mb-4">
              <h2 className="font-medium text-gray-700">System Memory</h2>
              <p>
                Used: {memory.used} MB / {memory.total} MB
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Memory data not available.</p>
          )}

          <div>
            <h2 className="font-medium text-gray-700">Inference</h2>
            <p>Last inference time: {inference_time_ms ?? "N/A"} ms</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Monitor;
