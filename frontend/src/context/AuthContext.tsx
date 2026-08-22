import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, SignInCredentials, SignUpCredentials } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (credentials: SignInCredentials) => Promise<User>;
  signup: (userData: SignUpCredentials) => Promise<User>;
  demoLogin: (role: UserRole) => Promise<User>;
  signout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "credentialchain_token";
const USER_KEY = "credentialchain_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session token on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        try {
          const res = await api.getMe(savedToken);
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          } else {
            // Token invalid
            signout();
          }
        } catch (err) {
          console.warn("Session verification warning:", err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const saveAuthSession = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const signin = async (credentials: SignInCredentials): Promise<User> => {
    const res = await api.signin(credentials);
    if (res.success && res.token && res.user) {
      saveAuthSession(res.token, res.user);
      return res.user;
    }
    throw new Error(res.error || "Failed to sign in.");
  };

  const signup = async (userData: SignUpCredentials): Promise<User> => {
    const res = await api.signup(userData);
    if (res.success && res.token && res.user) {
      saveAuthSession(res.token, res.user);
      return res.user;
    }
    throw new Error(res.error || "Failed to create account.");
  };

  const demoLogin = async (role: UserRole): Promise<User> => {
    const res = await api.demoLogin(role);
    if (res.success && res.token && res.user) {
      saveAuthSession(res.token, res.user);
      return res.user;
    }
    throw new Error(res.error || "Failed to log in to demo account.");
  };

  const signout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        signin,
        signup,
        demoLogin,
        signout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
