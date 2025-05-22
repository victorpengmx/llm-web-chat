import MessagePair from "./MessagePair";

const ChatWindow = ({ messages }) => (
  <>
    {messages.map((msg, idx) => (
      <MessagePair key={idx} prompt={msg.prompt} responseStream={msg.responseStream} />
    ))}
  </>
);

export default ChatWindow;
