import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const [onLogoutCallbacks, setOnLogoutCallbacks] = useState([]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (username) localStorage.setItem("username", username);
    else localStorage.removeItem("username");
  }, [username]);

  const setToken = (newToken, newUsername) => {
    setTokenState(newToken);
    setUsername(newUsername);
  };

  const logout = () => {
    setTokenState(null);
    setUsername(null);
    onLogoutCallbacks.forEach((cb) => cb());
  };

  const registerOnLogout = (cb) => {
  setOnLogoutCallbacks((prev) => [...prev, cb]);
  return () => {
    setOnLogoutCallbacks((prev) => prev.filter((fn) => fn !== cb));
  };
};


  return (
    <AuthContext.Provider value={{ token, username, setToken, logout, registerOnLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
