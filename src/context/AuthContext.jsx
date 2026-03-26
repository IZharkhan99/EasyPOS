import { createContext, useContext, useState, useCallback } from 'react';
import { USERS } from '../data/users';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email, password) => {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (!user) return false;
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
