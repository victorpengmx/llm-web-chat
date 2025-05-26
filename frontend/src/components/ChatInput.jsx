import { useState } from "react";
import "./ChatLayout.css"

const ChatInput = ({ authToken, sessionId, onSend, onStreamUpdate, refreshHistory }) => {
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setInput("");
    onSend(prompt);

    const res = await fetch(`http://localhost:8000/generate/stream/${sessionId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok || !res.body) {
      console.error("Failed to stream response");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      onStreamUpdate(chunk);
    }

    refreshHistory();
  };

  return (
    <div className="p-4 border-t flex">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="flex-1 px-4 py-2 border rounded mr-2"
        placeholder="Type your prompt..."
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
