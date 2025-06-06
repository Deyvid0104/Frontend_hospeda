"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "react-jwt";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage token on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = decodeToken(token);
        // Check token expiration
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ ...decoded, token });
        } else {
          sessionStorage.removeItem("token");
        }
      } catch (error) {
        sessionStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    sessionStorage.setItem("token", token);
    const decoded = decodeToken(token);
    setUser({ ...decoded, token });
    // Redirect based on role
    if (decoded.rol === "admin") {
      router.push("/usuarios");
    } else if (decoded.rol === "recepcionista") {
      router.push("/reservas");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
