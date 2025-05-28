import { useState } from "react";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";

/**
 * ChatInput component for entering and submitting prompts.
 * Uses a textarea and handles both button click and Enter key submission.
 *
 * Props:
 * - authToken: JWT for backend authorization
 * - sessionId: current chat session ID
 * - onSend: function called with the prompt once it's sent
 * - onStreamUpdate: function to receive streaming chunks
 * - refreshHistory: function to refresh chat history after generation
 */
const ChatInput = ({
  authToken,
  sessionId,
  onSend,
  onStreamUpdate,
  refreshHistory,
}) => {
  // State to hold current input, generation state, and error message
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  /**
   * Submits the current prompt to the backend for streaming generation.
   * Uses Fetch API to POST the prompt and reads from a streaming response.
   */
  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const prompt = input.trim();
    setInput(""); // Clear input before sending
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // Send prompt to backend for streaming generation
      const res = await fetch(
        `${baseUrl}/generate/stream/${sessionId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      // Handle rate limiting response
      if (res.status === 429) {
        setErrorMessage("You've hit the rate limit. Try again later.");
        setIsGenerating(false);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("Failed to stream response");
      }

      onSend(prompt); // Notify parent about the sent prompt

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Continuously read streaming chunks from response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        onStreamUpdate(chunk); // Append chunk to displayed message
      }

      refreshHistory(); // Refresh chat history in sidebar
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while generating a response.");
    } finally {
      setIsGenerating(false); // Reset loading state
    }
  };

  /**
   * Handles Enter key submission unless Shift+Enter (which inserts newline)
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Avoid newline
      handleSubmit();
    }
  };

  return (
    <Form className="p-3 border-top bg-light">
      <Form.Group controlId="chatInput">
        <InputGroup>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={
              isGenerating
                ? "Please wait for the response..."
                : "Type your prompt here..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            Send
          </Button>
        </InputGroup>
      </Form.Group>
      {errorMessage && (
        <Alert variant="danger" className="mt-2">
          {errorMessage}
        </Alert>
      )}
    </Form>
  );
};

export default ChatInput;
