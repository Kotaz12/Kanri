import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { db } from '@/data';
import { TipoTramite, Dependencia, Cliente, Usuario, ROUTES, calcularFechaLimite } from '@/lib';
import { useAuth } from '@/hooks/useAuth';
import { useNotif } from '@/hooks/useNotif';

interface FormData {
  titulo: string;
  descripcion: string;
  clienteId: string;
  tipoTramiteId: string;
  dependenciaId: string;
  responsable: string;
  empleadoAsignadoId: string;
  fechaIngreso: string;
  completado: boolean;
}

const EMPTY: FormData = {
  titulo: '',
  descripcion: '',
  clienteId: '',
  tipoTramiteId: '',
  dependenciaId: '',
  responsable: 'Empleado',
  empleadoAsignadoId: '',
  fechaIngreso: new Date().toISOString().split('T')[0],
  completado: false,
};

export default function TramiteForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { recargar } = useNotif();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState<TipoTramite[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    setTipos(db.tiposTramite.getAll());
    setDependencias(db.dependencias.getAll());
    setClientes(db.clientes.getAll());
    setUsuarios(db.usuarios.getAll());

    if (isEdit && id) {
      const t = db.tramites.getById(id);
      if (t) {
        setForm({
          titulo: t.titulo,
          descripcion: t.descripcion,
          clienteId: t.clienteId,
          tipoTramiteId: t.tipoTramiteId,
          dependenciaId: t.dependenciaId,
          responsable: t.responsable,
          empleadoAsignadoId: t.empleadoAsignadoId ?? '',
          fechaIngreso: t.fechaIngreso,
          completado: t.estatus === 'completado',
        });
      }
    }
  }, [isEdit, id]);

  const set = (key: keyof FormData, val: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.titulo.trim()) e.titulo = 'El título es requerido';
    if (!form.clienteId) e.clienteId = 'Selecciona un cliente';
    if (!form.tipoTramiteId) e.tipoTramiteId = 'Selecciona el tipo de trámite';
    if (!form.dependenciaId) e.dependenciaId = 'Selecciona la dependencia';
    if (!form.responsable.trim()) e.responsable = 'El responsable es requerido';
    if (!form.fechaIngreso) e.fechaIngreso = 'La fecha de ingreso es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const tipo = db.tiposTramite.getById(form.tipoTramiteId);
    const fechaLimite = tipo ? calcularFechaLimite(form.fechaIngreso, tipo.diasRespuesta) : form.fechaIngreso;

    try {
      if (isEdit && id) {
        db.tramites.update(id, {
          titulo: form.titulo,
          descripcion: form.descripcion,
          clienteId: form.clienteId,
          tipoTramiteId: form.tipoTramiteId,
          dependenciaId: form.dependenciaId,
          responsable: form.responsable,
          empleadoAsignadoId: form.empleadoAsignadoId || undefined,
          fechaIngreso: form.fechaIngreso,
          fechaLimite,
          estatus: form.completado ? 'completado' : undefined,
        });
      } else {
        db.tramites.create({
          titulo: form.titulo,
          descripcion: form.descripcion,
          clienteId: form.clienteId,
          tipoTramiteId: form.tipoTramiteId,
          dependenciaId: form.dependenciaId,
          responsable: form.responsable,
          empleadoAsignadoId: form.empleadoAsignadoId || undefined,
          fechaIngreso: form.fechaIngreso,
          fechaLimite,
        });
        recargar();
      }
      navigate(ROUTES.TRAMITES);
    } finally {
      setLoading(false);
    }
  };

  const tipoSeleccionado = tipos.find(t => t.id === form.tipoTramiteId);
  const fechaLimitePrev = tipoSeleccionado && form.fechaIngreso
    ? calcularFechaLimite(form.fechaIngreso, tipoSeleccionado.diasRespuesta)
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.TRAMITES)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{isEdit ? 'Editar trámite' : 'Nuevo trámite'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{isEdit ? 'Modifica los datos del trámite' : 'Registra un nuevo trámite en el sistema'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Título <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="Ej: Licencia de construcción residencial"
              className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.titulo ? 'border-destructive' : 'border-input'}`}
            />
            {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Descripción detallada del trámite..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
            />
          </div>

          {/* Cliente + Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Cliente <span className="text-destructive">*</span></label>
              <select
                value={form.clienteId}
                onChange={e => set('clienteId', e.target.value)}
                className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.clienteId ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {errors.clienteId && <p className="text-xs text-destructive mt-1">{errors.clienteId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de trámite <span className="text-destructive">*</span></label>
              <select
                value={form.tipoTramiteId}
                onChange={e => set('tipoTramiteId', e.target.value)}
                className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.tipoTramiteId ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Seleccionar tipo</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.diasRespuesta}d)</option>)}
              </select>
              {errors.tipoTramiteId && <p className="text-xs text-destructive mt-1">{errors.tipoTramiteId}</p>}
            </div>
          </div>

          {/* Dependencia + Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Dependencia <span className="text-destructive">*</span></label>
              <select
                value={form.dependenciaId}
                onChange={e => set('dependenciaId', e.target.value)}
                className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.dependenciaId ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Seleccionar dependencia</option>
                {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              {errors.dependenciaId && <p className="text-xs text-destructive mt-1">{errors.dependenciaId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Responsable <span className="text-destructive">*</span></label>
              <select
                value={form.responsable}
                onChange={e => set('responsable', e.target.value)}
                className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="Empleado">Empleado</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>
          </div>

          {/* Empleado asignado */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Empleado asignado <span className="text-muted-foreground text-xs">(opcional)</span></label>
            <select
              value={form.empleadoAsignadoId}
              onChange={e => set('empleadoAsignadoId', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="">Sin asignar</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>

          {/* Fecha ingreso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de ingreso <span className="text-destructive">*</span></label>
              <input
                type="date"
                value={form.fechaIngreso}
                onChange={e => set('fechaIngreso', e.target.value)}
                className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.fechaIngreso ? 'border-destructive' : 'border-input'}`}
              />
              {errors.fechaIngreso && <p className="text-xs text-destructive mt-1">{errors.fechaIngreso}</p>}
            </div>

            {fechaLimitePrev && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Fecha límite calculada</label>
                <div className="h-10 px-3 bg-muted border border-border rounded-lg text-sm flex items-center text-muted-foreground font-mono">
                  {new Date(fechaLimitePrev).toLocaleDateString('es-MX')} ({tipoSeleccionado?.diasRespuesta}d)
                </div>
              </div>
            )}
          </div>

          {/* Completado */}
          {isEdit && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <input
                id="completado"
                type="checkbox"
                checked={form.completado}
                onChange={e => set('completado', e.target.checked)}
                className="w-4 h-4 rounded border-input accent-primary"
              />
              <label htmlFor="completado" className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />
                Marcar como completado
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end mt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.TRAMITES)}
            className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear trámite'}
          </button>
        </div>
      </form>
    </div>
  );
}
