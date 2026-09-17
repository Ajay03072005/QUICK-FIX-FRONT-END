import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('quickfix_role') || 'CUSTOMER');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('quickfix_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('quickfix_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('quickfix_user') && localStorage.getItem('quickfix_token')));

  const login = (role, userData, authToken) => {
    const nextToken = authToken || token || 'session-token';
    setUserRole(role);
    setUser(userData);
    setToken(nextToken);
    setIsAuthenticated(true);
    localStorage.setItem('quickfix_role', role);
    localStorage.setItem('quickfix_user', JSON.stringify(userData));
    localStorage.setItem('quickfix_token', nextToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken('');
    localStorage.removeItem('quickfix_role');
    localStorage.removeItem('quickfix_user');
    localStorage.removeItem('quickfix_token');
  };

  return (
    <AuthContext.Provider value={{ userRole, user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
