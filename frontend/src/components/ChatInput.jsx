import { useState } from "react";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";

const ChatInput = ({
  authToken,
  sessionId,
  onSend,
  onStreamUpdate,
  refreshHistory,
}) => {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const prompt = input.trim();
    setInput(""); // Clear input before sending
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `http://localhost:8000/generate/stream/${sessionId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (res.status === 429) {
        setErrorMessage("You've hit the rate limit. Try again later.");
        setIsGenerating(false);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("Failed to stream response");
      }

      onSend(prompt);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        onStreamUpdate(chunk);
      }

      refreshHistory();
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while generating a response.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
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
