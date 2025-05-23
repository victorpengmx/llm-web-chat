import MessagePair from "./MessagePair";

const ChatWindow = ({ messages }) => {
  return (
    <div className="chat-window">
      {messages.map((msg, idx) => (
        <MessagePair key={idx} prompt={msg.prompt} response={msg.response} />
      ))}
    </div>
  );
};

export default ChatWindow;
