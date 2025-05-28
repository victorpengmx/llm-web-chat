import { useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Card,
} from "react-bootstrap";

/**
 * Login component for user authentication.
 * Handles username/password input, form submission,
 * error handling, and token storage.
 */
export default function Login() {
  // Form input states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // UI state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Context function to store token
  const { setToken } = useAuth();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();// Prevent default form reload
    setError(null);
    setLoading(true);

    try {
      // Format data for x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      // Send POST request to auth endpoint
      const res = await fetch(`${baseUrl}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await res.json();
      setToken(data.access_token, username); // Save token in context
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      {/* Center the login form vertically and horizontally */}
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card>
            <Card.Body>
              <h2 className="mb-4 text-center">Login</h2>

              {/* Display error alert if login failed */}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Username input */}
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>

                {/* Password input */}
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Submit button with loading state */}
                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
