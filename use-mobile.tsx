import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Send, Plus, Clock, Building2, User, Tag, Calendar, MessageSquare } from 'lucide-react';
import { db } from '@/data';
import { Tramite, Nota, ROUTES, formatFecha, formatFechaHora, diasRestantes } from '@/lib';
import { StatusBadge, ConfirmDialog } from '@/components/UI';
import { useAuth } from '@/hooks/useAuth';
import { useNotif } from '@/hooks/useNotif';

export default function TramiteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { recargar } = useNotif();

  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteTramite, setShowDeleteTramite] = useState(false);

  const cargar = () => {
    if (!id) return;
    const t = db.tramites.getById(id);
    setTramite(t ?? null);
    setNotas(db.notas.getByTramite(id));
  };

  useEffect(() => { cargar(); }, [id]);

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim() || !id || !usuario) return;
    setEnviando(true);
    db.notas.create({
      tramiteId: id,
      contenido: nuevaNota.trim(),
      autorId: usuario.id,
      autorNombre: usuario.nombre,
    });
    recargar();
    setNuevaNota('');
    cargar();
    setEnviando(false);
  };

  const handleEliminarNota = (notaId: string) => {
    db.notas.delete(notaId);
    cargar();
  };

  const handleEliminarTramite = () => {
    if (!id) return;
    db.tramites.delete(id);
    navigate(ROUTES.TRAMITES);
  };

  const handleCompletar = () => {
    if (!id || !tramite) return;
    db.tramites.update(id, { estatus: 'completado' });
    cargar();
  };

  if (!tramite) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Trámite no encontrado</p>
        <button onClick={() => navigate(ROUTES.TRAMITES)} className="text-sm text-primary hover:underline">
          Volver a trámites
        </button>
      </div>
    );
  }

  const cliente = db.clientes.getById(tramite.clienteId);
  const tipo = db.tiposTramite.getById(tramite.tipoTramiteId);
  const dep = db.dependencias.getById(tramite.dependenciaId);
  const empleado = tramite.empleadoAsignadoId ? db.usuarios.getById(tramite.empleadoAsignadoId) : null;
  const dr = diasRestantes(tramite.fechaLimite);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(ROUTES.TRAMITES)}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground mt-0.5"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground flex-1 min-w-0">{tramite.titulo}</h1>
            <StatusBadge estatus={tramite.estatus} />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">ID: {tramite.id}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tramite.estatus !== 'completado' && (
            <button
              onClick={handleCompletar}
              className="h-8 px-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              ✓ Completar
            </button>
          )}
          <button
            onClick={() => navigate(`/tramites/${tramite.id}/editar`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setShowDeleteTramite(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Información del trámite</h3>
          <div className="space-y-3">
            {tramite.descripcion && (
              <p className="text-sm text-foreground">{tramite.descripcion}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Tag size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Tipo:</span>
              <span className="text-foreground font-medium">{tipo?.nombre ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Dependencia:</span>
              <span className="text-foreground font-medium">{dep?.nombre ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Responsable:</span>
              <span className="text-foreground font-medium">{tramite.responsable}</span>
            </div>
            {empleado && (
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Empleado:</span>
                <span className="text-foreground font-medium">{empleado.nombre}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Fechas y cliente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Cliente:</span>
              <span className="text-foreground font-medium">{cliente?.nombre ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Ingreso:</span>
              <span className="text-foreground font-mono">{formatFecha(tramite.fechaIngreso)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Límite:</span>
              <span className="text-foreground font-mono">{formatFecha(tramite.fechaLimite)}</span>
            </div>
            {tramite.estatus !== 'completado' && (
              <div className={`flex items-center gap-2 text-sm font-semibold ${dr < 0 ? 'text-red-600 dark:text-red-400' : dr <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                <Clock size={14} className="shrink-0" />
                {dr < 0 ? `Venció hace ${Math.abs(dr)} día${Math.abs(dr) !== 1 ? 's' : ''}` : `${dr} día${dr !== 1 ? 's' : ''} restante${dr !== 1 ? 's' : ''}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <MessageSquare size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Notas y comentarios</h2>
          <span className="ml-auto text-xs text-muted-foreground">{notas.length} nota{notas.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Nueva nota */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <User size={14} className="text-primary" />
            </div>
            <div className="flex-1">
              <textarea
                value={nuevaNota}
                onChange={e => setNuevaNota(e.target.value)}
                placeholder="Escribe una nota o comentario sobre este trámite..."
                rows={2}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAgregarNota(); }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Ctrl+Enter para enviar</span>
                <button
                  onClick={handleAgregarNota}
                  disabled={!nuevaNota.trim() || enviando}
                  className="flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send size={13} />
                  {enviando ? 'Enviando...' : 'Agregar nota'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de notas */}
        {notas.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <MessageSquare size={24} className="mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No hay notas aún. ¡Agrega la primera!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notas.map(nota => (
              <div key={nota.id} className="px-5 py-4 flex gap-3 group">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{nota.autorNombre}</span>
                    <span className="text-xs text-muted-foreground">{formatFechaHora(nota.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{nota.contenido}</p>
                </div>
                <button
                  onClick={() => setDeleteId(nota.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { handleEliminarNota(deleteId); setDeleteId(null); } }}
        title="¿Eliminar nota?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar nota"
      />

      <ConfirmDialog
        open={showDeleteTramite}
        onCancel={() => setShowDeleteTramite(false)}
        onConfirm={handleEliminarTramite}
        title="¿Eliminar trámite?"
        description="Se eliminará el trámite y todas sus notas. Esta acción no se puede deshacer."
      />
    </div>
  );
}
