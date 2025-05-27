import { useNavigate } from "react-router-dom";

const Sidebar = ({
  username,
  onLogout,
  sessions,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  activeSession,
}) => {
  const navigate = useNavigate();

  const goToMonitor = () => {
    navigate("/monitor");
  };

  return (
    <div className="w-64 h-full bg-white border-r p-4 flex flex-col justify-between">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Chat App</h2>
          <p className="mt-2 text-sm text-gray-600">
            Logged in as <strong>{username}</strong>
          </p>
          <button
            onClick={onLogout}
            className="mt-2 text-sm text-red-600 hover:underline self-start"
          >
            Logout
          </button>
        </div>

        <button
          onClick={goToMonitor}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Monitoring Dashboard
        </button>

        <button
          onClick={onNewSession}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          + New Chat
        </button>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sessions</h3>
          <div className="flex flex-col space-y-1 max-h-[60vh] overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between px-2 py-1 rounded ${
                  session.id === activeSession
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <button
                  onClick={() => onSwitchSession(session.id)}
                  className="flex-1 text-left truncate"
                >
                  {session.preview || "(empty)"}
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="ml-2 text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
