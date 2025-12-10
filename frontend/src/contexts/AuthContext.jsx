import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [is_admin, setIs_admin] = useState(localStorage.getItem('is_admin') || '');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    localStorage.setItem('is_admin', is_admin.toString());
  }, [isLoggedIn, username, token, is_admin]);

  const login = ( name, token, is_admin ) => {
    setIsLoggedIn(true);
    setUsername(name);
    setToken(token);
    setIs_admin(is_admin);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setToken('');
    setIs_admin(false);
    localStorage.removeItem('is_admin');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, token, is_admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);