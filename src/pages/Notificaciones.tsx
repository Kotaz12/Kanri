import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { useNotif } from '@/hooks/useNotif';
import { formatFechaHora } from '@/lib';

const TIPO_ICON: Record<string, string> = {
  nuevo_tramite: '📋',
  nota_agregada: '💬',
  tramite_actualizado: '✏️',
};

export default function Notificaciones() {
  const { notificaciones, marcarLeida, marcarTodasLeidas, noLeidas } = useNotif();
  const navigate = useNavigate();

  const handleClick = (id: string, tramiteId?: string) => {
    marcarLeida(id);
    if (tramiteId) navigate(`/tramites/${tramiteId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todas leídas'}
          </p>
        </div>
        {noLeidas > 0 && (
          <button
            onClick={marcarTodasLeidas}
            className="flex items-center gap-2 h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <CheckCheck size={15} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {notificaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Sin notificaciones</h3>
            <p className="text-sm text-muted-foreground">Las notificaciones aparecerán aquí cuando haya actividad</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notificaciones.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n.id, n.tramiteId)}
                className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${!n.leida ? 'bg-primary/5' : ''}`}
              >
                {/* Dot */}
                <div className="relative mt-0.5 shrink-0">
                  <span className="text-xl">{TIPO_ICON[n.tipo] ?? '🔔'}</span>
                  {!n.leida && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.leida ? 'text-foreground' : 'text-muted-foreground'}`}>{n.titulo}</p>
                    {!n.leida && (
                      <span className="shrink-0 text-xs px-1.5 py-0.5 bg-primary/15 text-primary rounded font-medium">Nuevo</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensaje}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {formatFechaHora(n.createdAt)}
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); marcarLeida(n.id); }}
                  className={`shrink-0 mt-1 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors ${!n.leida ? 'text-primary' : 'text-muted-foreground/40'}`}
                  title="Marcar como leída"
                >
                  <CheckCheck size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
