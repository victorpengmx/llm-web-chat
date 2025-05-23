import { useState, useEffect } from "react";

export default function useAuth() {
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }
  }, [username]);

  const setToken = (newToken, newUsername) => {
    setTokenState(newToken);
    setUsername(newUsername);
  };

  const logout = () => {
    setTokenState(null);
    setUsername(null);
  };

  return { token, username, setToken, logout };
}
