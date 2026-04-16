import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit2, Eye } from 'lucide-react';
import { db } from '@/data';
import { Tramite, ColorEstatus, ROUTES, formatFecha, diasRestantes } from '@/lib';
import { StatusBadge, EmptyState, ConfirmDialog } from '@/components/UI';

const FILTROS: { label: string; value: ColorEstatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: '🟢 A tiempo', value: 'verde' },
  { label: '🟡 Por vencer', value: 'amarillo' },
  { label: '🔴 Fuera de tiempo', value: 'rojo' },
  { label: '🔵 Completados', value: 'completado' },
];

export default function Tramites() {
  const navigate = useNavigate();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [filtro, setFiltro] = useState<ColorEstatus | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cargar = () => setTramites(db.tramites.getAll());
  useEffect(() => { cargar(); }, []);

  const handleEliminar = () => {
    if (!deleteId) return;
    db.tramites.delete(deleteId);
    setDeleteId(null);
    cargar();
  };

  const filtrados = tramites.filter(t => {
    const coincideFiltro = filtro === 'todos' || t.estatus === filtro;
    const coincideBusqueda = !busqueda || t.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Trámites</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tramites.length} trámite{tramites.length !== 1 ? 's' : ''} registrado{tramites.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.TRAMITE_NUEVO)}
          className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo trámite
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar trámites..."
            className="w-full h-9 pl-9 pr-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors border ${
                filtro === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <EmptyState
            icon={<Filter size={28} />}
            title="Sin trámites"
            description={busqueda || filtro !== 'todos' ? 'No hay trámites que coincidan con el filtro.' : 'Aún no hay trámites. ¡Crea el primero!'}
            action={
              <button
                onClick={() => navigate(ROUTES.TRAMITE_NUEVO)}
                className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Nuevo trámite
              </button>
            }
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Trámite</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Cliente</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Dependencia</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Fecha límite</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Días</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Estatus</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(t => {
                    const cliente = db.clientes.getById(t.clienteId);
                    const dep = db.dependencias.getById(t.dependenciaId);
                    const dr = diasRestantes(t.fechaLimite);
                    return (
                      <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-foreground line-clamp-1 max-w-[200px]">{t.titulo}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{cliente?.nombre ?? '-'}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{dep?.nombre ?? '-'}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground font-mono">{formatFecha(t.fechaLimite)}</td>
                        <td className="px-3 py-3">
                          {t.estatus === 'completado' ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <span className={`text-sm font-semibold ${dr < 0 ? 'text-red-600 dark:text-red-400' : dr <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                              {dr < 0 ? `${Math.abs(dr)}d` : `${dr}d`}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3"><StatusBadge estatus={t.estatus} /></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/tramites/${t.id}`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              title="Ver detalle"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/tramites/${t.id}/editar`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              title="Editar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(t.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {filtrados.map(t => {
                const cliente = db.clientes.getById(t.clienteId);
                const dr = diasRestantes(t.fechaLimite);
                return (
                  <div key={t.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{t.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cliente?.nombre ?? '-'} • {formatFecha(t.fechaLimite)}</p>
                      </div>
                      <StatusBadge estatus={t.estatus} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/tramites/${t.id}`)}
                        className="flex items-center gap-1 h-7 px-2.5 bg-muted rounded-md text-xs font-medium hover:bg-muted/80 transition-colors"
                      >
                        <Eye size={12} /> Ver
                      </button>
                      <button
                        onClick={() => navigate(`/tramites/${t.id}/editar`)}
                        className="flex items-center gap-1 h-7 px-2.5 bg-muted rounded-md text-xs font-medium hover:bg-muted/80 transition-colors"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="flex items-center gap-1 h-7 px-2.5 bg-destructive/10 rounded-md text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleEliminar}
        title="¿Eliminar trámite?"
        description="Se eliminará el trámite y todas sus notas. Esta acción no se puede deshacer."
      />
    </div>
  );
}
