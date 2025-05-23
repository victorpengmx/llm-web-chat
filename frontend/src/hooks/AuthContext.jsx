import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

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
  };

  return (
    <AuthContext.Provider value={{ token, username, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
