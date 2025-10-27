import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token)
 : null;
  });

  const login = async (email, password) => {
    try {
      const res = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      console.log(data);


      if (data.token) {
        localStorage.setItem("token", data.token);
        setUserToken(data.token);
        setUser(jwtDecode(data.token)
); // decode token and set user
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setUserToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (userToken) {
      try {
        const decoded = jwtDecode(userToken)
;
        setUser(decoded);
      } catch (e) {
        console.error("Invalid token");
        logout();
      }
    }
  }, [userToken]);

  return (
    <AuthContext.Provider value={{
      userToken,
      user, // ⬅️ user info available across app
      isAuthenticated: !!userToken,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
