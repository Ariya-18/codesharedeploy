import { createContext, useContext, useState, useEffect } from "react";
import { getProfileApi } from "../services/authService";
import socket from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if a valid token exists and fetch the user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      socket.disconnect();
      return;
    }

    getProfileApi()
      .then((res) => {
        setUser(res.data);
        // Connect socket after user is loaded
        if (!socket.connected) {
          socket.connect();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        socket.disconnect();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    setUser(userData);
    // Connect socket immediately after login
    if (!socket.connected) {
      socket.connect();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);