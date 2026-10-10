import React, { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading] = useState(false);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    // data = { token, userId, username, role, customerId, name }
    const authUser = {
      userId: data.userId,
      username: data.username,
      role: data.role,
      customerId: data.customerId,
      name: data.name || data.username,
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(authUser));

    setToken(data.token);
    setUser(authUser);

    return authUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isCustomer = user?.role === 'ROLE_CUSTOMER' || user?.role === 'CUSTOMER';
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isCustomer,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
