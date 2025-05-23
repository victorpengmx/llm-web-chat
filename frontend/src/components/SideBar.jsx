import React from "react";

const Sidebar = ({ username, onLogout }) => {
  return (
    <div className="w-64 h-full bg-white border-r p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Chat App</h2>
        <p className="mt-2 text-sm text-gray-600">
          Logged in as <strong>{username}</strong>
        </p>
      </div>
      <button
        onClick={onLogout}
        className="text-sm text-red-600 hover:underline self-start"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
