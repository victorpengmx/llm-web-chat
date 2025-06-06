import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Card,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

/**
 * Monitor component displays real-time system usage metrics.
 * Fetches backend GPU, memory, and inference time data periodically.
 */
const Monitor = () => {
  const [data, setData] = useState(null); // Holds metrics fetched from the backend
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        const res = await fetch(`${baseUrl}/metrics`);
        if (!res.ok) throw new Error("Failed to fetch monitor data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMonitorData(); // Initial fetch
    const interval = setInterval(fetchMonitorData, 2000); // Refresh every 2s
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Destructure monitoring data and use empty defaults to prevent crashes
  const { gpus = [], memory, inference_time_ms } = data || {};

  return (
    <Container className="py-4">
      <div className="mb-4">
        <Button variant="primary" onClick={() => navigate("/")}>
          Back to Chat
        </Button>
      </div>

      <h1 className="mb-4">Monitoring Dashboard</h1>

      {error ? (
        <Alert variant="danger">Error: {error}</Alert>
      ) : !data ? (
        <div className="text-center text-muted">
          Loading monitoring data...
        </div>
      ) : (
        <>
          {gpus.length > 0 ? (
            <>
              <h4 className="mb-3 text-secondary">GPUs</h4>
              <Row>
                {gpus.map((gpu) => (
                  <Col key={gpu.index} md={6} lg={4} className="mb-4">
                    <Card>
                      <Card.Body>
                        <Card.Title>GPU {gpu.index}: {gpu.name}</Card.Title>
                        <Card.Text>
                          <strong>Utilization:</strong> {gpu.utilization}%<br />
                          <strong>Memory Used:</strong> {gpu.memory_used} MB / {gpu.memory_total} MB
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <p className="text-muted">GPU data not available.</p>
          )}

          {/* Memory Section */}
          {memory ? (
            <>
              <h4 className="mt-4 text-secondary">System Memory</h4>
              <p>
                <strong>Used:</strong> {memory.used} MB / {memory.total} MB
              </p>
            </>
          ) : (
            <p className="text-muted">Memory data not available.</p>
          )}

          {/* Inference Time Section */}
          <h4 className="mt-4 text-secondary">Inference</h4>
          <p>
            <strong>Last inference time:</strong>{" "}
            {inference_time_ms !== undefined ? `${inference_time_ms} ms` : "N/A"}
          </p>
        </>
      )}
    </Container>
  );
};

export default Monitor;
