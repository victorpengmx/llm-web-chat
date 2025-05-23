import { useState } from "react";
import "./ChatLayout.css";

const ChatInput = ({ onSend, onStreamUpdate, authToken }) => {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    // Add prompt to chat with empty response first
    onSend(prompt);
    setInput(""); // Clear the input field

    try {
      const res = await fetch("http://localhost:8000/generate/stream", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        onStreamUpdate(chunk);
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input"
        placeholder="Type your prompt..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSend} className="chat-button">
        Send
      </button>
    </div>
  );
};

export default ChatInput;
