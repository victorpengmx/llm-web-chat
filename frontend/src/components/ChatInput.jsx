import { useState } from "react";

const ChatInput = ({ onSend, onStreamUpdate }) => {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    onSend(input); // Add the prompt with empty response
    const prompt = input;
    setInput(""); // Clear input

    const res = await fetch("http://localhost:8000/generate/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      onStreamUpdate(chunk); // Append to the current response
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border rounded p-2"
        placeholder="Type your prompt..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend} className="px-4 py-2 bg-blue-500 text-white rounded">
        Send
      </button>
    </div>
  );
};

export default ChatInput;
