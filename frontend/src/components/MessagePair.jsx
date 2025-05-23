const MessagePair = ({ prompt, response }) => (
  <div className="chat-container">
    <p><strong>User:</strong> {prompt}</p>
    <p><strong>AI:</strong> {response}</p>
  </div>
);

export default MessagePair;
