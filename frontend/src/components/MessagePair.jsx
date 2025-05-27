import { Card } from "react-bootstrap";

const MessagePair = ({ prompt, response }) => (
  <Card className="mb-3">
    <Card.Body>
      <Card.Text>
        <strong>User:</strong> {prompt}
      </Card.Text>
      <Card.Text>
        <strong>AI:</strong> {response}
      </Card.Text>
    </Card.Body>
  </Card>
);

export default MessagePair;
