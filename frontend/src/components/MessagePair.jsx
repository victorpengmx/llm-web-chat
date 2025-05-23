const MessagePair = ({ prompt, responseStream }) => (
  <div className="chat-container">
    <p><strong>User:</strong> {prompt}</p>
    <p><strong>AI:</strong> {responseStream}</p>
  </div>

);

export default MessagePair;
