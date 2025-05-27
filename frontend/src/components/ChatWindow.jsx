import MessagePair from "./MessagePair";
import { Container } from "react-bootstrap";

const ChatWindow = ({ messages }) => {
  return (
    <Container
      fluid
      className="flex-grow-1 overflow-auto px-4 py-3"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {messages.map((msg, idx) => (
        <MessagePair key={idx} prompt={msg.prompt} response={msg.response} />
      ))}
    </Container>
  );
};

export default ChatWindow;
