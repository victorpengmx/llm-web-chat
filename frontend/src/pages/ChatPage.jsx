import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import Sidebar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

const ChatPage = () => {
  const { token: authToken, username, logout, registerOnLogout } = useAuth();
  const [messages, setMessages] = useState([]);

  // Clear messages on logout
  useEffect(() => {
    registerOnLogout(() => setMessages([]));
  }, [registerOnLogout]);

  useEffect(() => {
    if (!authToken) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/history", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
  }, [authToken]);

  const handleSend = (prompt) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), prompt, response: "" },
    ]);
  };

  const handleStreamUpdate = (delta) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = {
        ...last,
        response: last.response + delta,
      };
      return updated;
    });
  };

  return (
    <div className="chat-page flex h-screen">
      <Sidebar username={username} onLogout={logout} />
      <div className="flex flex-col flex-1">
        <ChatWindow messages={messages} />
        <ChatInput
          authToken={authToken}
          onSend={handleSend}
          onStreamUpdate={handleStreamUpdate}
          refreshHistory={() => {
            fetch("http://localhost:8000/history", {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            })
              .then((res) => res.json())
              .then(setMessages)
              .catch(console.error);
          }}
        />
      </div>
    </div>
  );
};

export default ChatPage;
