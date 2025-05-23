import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/AuthContext";

// Import pages
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login";

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <ChatPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
