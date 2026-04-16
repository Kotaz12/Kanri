import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Usuario, verificarToken } from '@/lib';
import { db } from '@/data';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  registro: (nombre: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('kanri_token');
    const savedUser = localStorage.getItem('kanri_usuario');
    if (savedToken && savedUser) {
      const payload = verificarToken(savedToken);
      if (payload) {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUser) as Usuario);
      } else {
        localStorage.removeItem('kanri_token');
        localStorage.removeItem('kanri_usuario');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const result = db.auth.login(email, password);
    if (!result) return { error: 'Correo o contraseña incorrectos' };
    setToken(result.token);
    setUsuario(result.usuario);
    localStorage.setItem('kanri_token', result.token);
    localStorage.setItem('kanri_usuario', JSON.stringify(result.usuario));
    return {};
  }, []);

  const registro = useCallback(async (nombre: string, email: string, password: string): Promise<{ error?: string }> => {
    const result = db.auth.registro(nombre, email, password);
    if (!result) return { error: 'El correo ya está registrado' };
    setToken(result.token);
    setUsuario(result.usuario);
    localStorage.setItem('kanri_token', result.token);
    localStorage.setItem('kanri_usuario', JSON.stringify(result.usuario));
    return {};
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('kanri_token');
    localStorage.removeItem('kanri_usuario');
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, isLoading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
