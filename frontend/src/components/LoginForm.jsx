// src/components/LoginForm.jsx
import { useState } from "react";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            username,
            password,
        }),
      });


      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      onLogin(data.access_token, username);
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto mt-20">
      <h2 className="text-2xl mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        className="w-full p-2 mb-2 border"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 border"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 w-full" type="submit">
        Log In
      </button>
    </form>
  );
};

export default LoginForm;
