const MessagePair = ({ prompt, responseStream }) => (
  <div className="mb-4">
    <div className="font-semibold text-gray-800">User:</div>
    <div className="bg-white p-2 rounded shadow">{prompt}</div>
    <div className="mt-2 font-semibold text-green-700">AI:</div>
    <div className="bg-green-50 p-2 rounded shadow whitespace-pre-wrap">
      {responseStream}
    </div>
  </div>
);

export default MessagePair;
