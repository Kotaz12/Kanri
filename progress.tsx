import React, { createContext, useContext, useState, useCallback } from 'react';
import { db } from '@/data';
import { Notificacion } from '@/lib';

interface NotifContextType {
  notificaciones: Notificacion[];
  noLeidas: number;
  recargar: () => void;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
}

const NotifContext = createContext<NotifContextType | null>(null);

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => db.notificaciones.getAll());

  const recargar = useCallback(() => {
    setNotificaciones(db.notificaciones.getAll());
  }, []);

  const marcarLeida = useCallback((id: string) => {
    db.notificaciones.marcarLeida(id);
    setNotificaciones(db.notificaciones.getAll());
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    db.notificaciones.marcarTodasLeidas();
    setNotificaciones(db.notificaciones.getAll());
  }, []);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <NotifContext.Provider value={{ notificaciones, noLeidas, recargar, marcarLeida, marcarTodasLeidas }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif debe usarse dentro de NotifProvider');
  return ctx;
}
