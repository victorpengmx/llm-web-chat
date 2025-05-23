import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./components/ChatLayout.css";

function App() {
  const [messages, setMessages] = useState([]);

  // Load history once when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/history");
        const data = await res.json();
        // Convert to expected format with prompt & responseStream
        const parsed = data.map((msg) => ({
          prompt: msg.prompt,
          responseStream: msg.response,
        }));
        setMessages(parsed);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, []);

  const addPrompt = (prompt) => {
    setMessages((prev) => [...prev, { prompt, responseStream: "" }]);
  };

  const updateLastResponse = (chunk) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMsg = updated[updated.length - 1];

      updated[updated.length - 1] = {
        ...lastMsg,
        responseStream: lastMsg.responseStream + chunk,
      };

      return updated;
    });
  };

  return (
    <div className="app-outer">
      <div className="app-inner">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <ChatWindow messages={messages} />
          </div>
          <div className="border-t p-4 bg-white">
            <ChatInput onSend={addPrompt} onStreamUpdate={updateLastResponse} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
