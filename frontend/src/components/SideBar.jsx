import { useNavigate } from "react-router-dom";
import { Button, Container, ListGroup } from "react-bootstrap";

/**
 * Sidebar component for navigation and session management.
 * Displays username, session list, and control buttons for creating/deleting sessions,
 * as well as navigating to the monitoring dashboard.
 */
const Sidebar = ({
  username, // Logged-in user's name
  onLogout, // Function to call when logout button is clicked
  sessions, // List of user sessions (array of { id, preview })
  onNewSession, // Function to create a new chat session
  onSwitchSession, // Function to switch to a different session by ID
  onDeleteSession, // Function to delete a session by ID
  activeSession, // ID of the currently active session
}) => {
  const navigate = useNavigate();

  // Navigate to the monitoring dashboard page
  const goToMonitor = () => {
    navigate("/monitor");
  };

  return (
    <Container
      fluid
      className="bg-light border-end d-flex flex-column p-3"
      style={{ width: "280px", height: "100vh" }}
    >
      {/* Header section with user info and logout */}
      <div>
        <h5>Chat App</h5>
        <p className="text-muted mb-1">
          Logged in as <strong>{username}</strong>
        </p>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>

      {/* Dashboard and new chat buttons */}
      <div className="my-3">
        <Button variant="success" className="w-100 mb-2" onClick={goToMonitor}>
          Monitoring Dashboard
        </Button>
        <Button variant="primary" className="w-100" onClick={onNewSession}>
          + New Chat
        </Button>
      </div>

      {/* Scrollable list of sessions */}
      <div className="flex-grow-1 overflow-auto">
        <h6 className="text-secondary mt-2">Sessions</h6>
        <ListGroup>
          {sessions.map((session) => (
            <ListGroup.Item
              key={session.id}
              action
              active={session.id === activeSession}
              onClick={() => onSwitchSession(session.id)}
              className="d-flex justify-content-between align-items-center"
              as="div" // Prevent nested button issue
            >
              {/* Session preview text (truncated) */}
              <span className="text-truncate" style={{ maxWidth: "160px" }}>
                {session.preview?.slice(0, 20) || "Untitled session"}
              </span>
              
              {/* Delete session button */}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent switching session on delete click
                  if (window.confirm("Delete this session?")) {
                    onDeleteSession(session.id);
                  }
                }}
              >
                &times;
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </Container>
  );
};

export default Sidebar;
