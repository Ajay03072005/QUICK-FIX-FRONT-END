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
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('quickfix_user')));

  const switchRole = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('quickfix_role', newRole);
    if (newRole === 'PROVIDER') {
      logout();
    } else {
      logout();
    }
  };

  const login = (role, userData) => {
    setUserRole(role);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('quickfix_role', role);
    localStorage.setItem('quickfix_user', JSON.stringify(userData));
    localStorage.setItem('quickfix_token', 'session-token');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('quickfix_role');
    localStorage.removeItem('quickfix_user');
    localStorage.removeItem('quickfix_token');
  };

  return (
    <AuthContext.Provider value={{ userRole, user, isAuthenticated, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
