import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import Sidebar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

const ChatPage = () => {
    const { token: authToken, username, logout, registerOnLogout } = useAuth();

    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    // Clear on logout
    useEffect(() => {
        const unregister = registerOnLogout(() => {
            setMessages([]);
            setSessions([]);
            setActiveSession(null);
        });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load sessions on mount
    useEffect(() => {
        if (!authToken) return;
        fetchSessions();
    }, [authToken]);

    const fetchSessions = async () => {
        try {
        const res = await fetch("http://localhost:8000/sessions", {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setSessions(data);
        // Auto-load the first session
        } catch (error) {
        console.error(error);
        }
    };

    useEffect(() => {
        if (sessions.length > 0 && !activeSession) {
            switchToSession(sessions[0].id);
        }
    }, [sessions, activeSession]);


    const switchToSession = async (sessionId) => {
        setActiveSession(sessionId);
        try {
        const res = await fetch(`http://localhost:8000/sessions/${sessionId}/history`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch session history");
        const data = await res.json();
        setMessages(data);
        } catch (error) {
        console.error(error);
        }
    };

    const createNewSession = async () => {
        try {
        const res = await fetch("http://localhost:8000/sessions", {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to create new session");
        const data = await res.json();
        await fetchSessions(); // refresh list
        await switchToSession(data.session_id);
        } catch (error) {
        console.error(error);
        }
    };

    const deleteSession = async (sessionId) => {
        try {
            await fetch(`http://localhost:8000/sessions/${sessionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const newSessions = sessions.filter((s) => s.id !== sessionId);
            setSessions(newSessions);

            if (sessionId === activeSession) {
                if (newSessions.length > 0) {
                    await switchToSession(newSessions[0].id);
                } else {
                    setActiveSession(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };


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
            <Sidebar
                username={username}
                onLogout={logout}
                sessions={sessions}
                onNewSession={createNewSession}
                onSwitchSession={switchToSession}
                onDeleteSession={deleteSession}
                activeSession={activeSession}
            />
            <div className="flex flex-col flex-1">
                <ChatWindow messages={messages} />
                {activeSession && (
                <ChatInput
                    authToken={authToken}
                    sessionId={activeSession}
                    onSend={handleSend}
                    onStreamUpdate={handleStreamUpdate}
                    refreshHistory={() => switchToSession(activeSession)}
                />
                )}
            </div>
        </div>
    );
};

export default ChatPage;
