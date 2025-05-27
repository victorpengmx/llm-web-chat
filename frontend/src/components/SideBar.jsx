import { useNavigate } from "react-router-dom";
import { Button, Container, ListGroup } from "react-bootstrap";

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
    <Container
      fluid
      className="bg-light border-end d-flex flex-column p-3"
      style={{ width: "280px", height: "100vh" }}
    >
      <div>
        <h5>Chat App</h5>
        <p className="text-muted mb-1">
          Logged in as <strong>{username}</strong>
        </p>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>

      <div className="my-3">
        <Button variant="success" className="w-100 mb-2" onClick={goToMonitor}>
          Monitoring Dashboard
        </Button>
        <Button variant="primary" className="w-100" onClick={onNewSession}>
          + New Chat
        </Button>
      </div>

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
              <span className="text-truncate" style={{ maxWidth: "160px" }}>
                {session.preview?.slice(0, 20) || "Untitled session"}
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
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
