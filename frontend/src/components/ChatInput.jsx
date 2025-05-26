import { useState } from "react";
import "./ChatLayout.css";

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
    setInput("");
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

  return (
    <div className="p-4 border-t flex flex-col space-y-2">
      <div className="flex">
        <input
          type="text"
          value={input}
          disabled={isGenerating}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 px-4 py-2 border rounded mr-2"
          placeholder={
            isGenerating
              ? "Please wait for the response..."
              : "Type your prompt..."
          }
        />
        <button
          onClick={handleSubmit}
          disabled={isGenerating}
          className={`px-4 py-2 rounded text-white ${
            isGenerating ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Send
        </button>
      </div>
      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}
    </div>
  );
};

export default ChatInput;
