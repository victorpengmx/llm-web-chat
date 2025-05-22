import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);

  const addPrompt = (prompt) => {
    setMessages((prev) => [...prev, { prompt, responseStream: "" }]);
  };

  const updateLastResponse = (chunk) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMsg = updated[updated.length - 1];

      // Prevent duplicating of tokens
      updated[updated.length - 1] = {
        ...lastMsg,
        responseStream: lastMsg.responseStream + chunk,
      };

      return updated;
    });
  };


  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <ChatWindow messages={messages} />
      </div>
      <div className="border-t p-4 bg-white">
        <ChatInput onSend={addPrompt} onStreamUpdate={updateLastResponse} />
      </div>
    </div>
  );
}

export default App;
