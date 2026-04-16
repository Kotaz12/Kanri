import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Clock } from 'lucide-react';
import { db } from '@/data';
import { TipoTramite } from '@/lib';
import { EmptyState, ConfirmDialog } from '@/components/UI';

interface FormTipo {
  nombre: string;
  descripcion: string;
  diasRespuesta: number;
}

const EMPTY: FormTipo = { nombre: '', descripcion: '', diasRespuesta: 5 };

function ModalTipo({ open, tipo, onClose, onSave }: { open: boolean; tipo?: TipoTramite | null; onClose: () => void; onSave: (d: FormTipo) => void }) {
  const [form, setForm] = useState<FormTipo>(EMPTY);
  const [errors, setErrors] = useState<Partial<{ nombre: string; diasRespuesta: string }>>({});

  useEffect(() => {
    if (open) setForm(tipo ? { nombre: tipo.nombre, descripcion: tipo.descripcion, diasRespuesta: tipo.diasRespuesta } : EMPTY);
    setErrors({});
  }, [open, tipo]);

  const set = (k: keyof FormTipo, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<{ nombre: string; diasRespuesta: string }> = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (form.diasRespuesta < 1) e.diasRespuesta = 'Debe ser al menos 1 día';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{tipo ? 'Editar tipo de trámite' : 'Nuevo tipo de trámite'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre <span className="text-destructive">*</span></label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Licencia de Construcción" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.nombre ? 'border-destructive' : 'border-input'}`} />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción del tipo de trámite" rows={2} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Días de respuesta <span className="text-destructive">*</span></label>
            <input type="number" min={1} max={365} value={form.diasRespuesta} onChange={e => set('diasRespuesta', parseInt(e.target.value) || 1)} className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.diasRespuesta ? 'border-destructive' : 'border-input'}`} />
            {errors.diasRespuesta ? <p className="text-xs text-destructive mt-1">{errors.diasRespuesta}</p> : <p className="text-xs text-muted-foreground mt-1">Plazo máximo de respuesta en días hábiles</p>}
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80">Cancelar</button>
            <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">{tipo ? 'Guardar cambios' : 'Crear tipo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TiposTramite() {
  const [tipos, setTipos] = useState<TipoTramite[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<TipoTramite | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cargar = () => setTipos(db.tiposTramite.getAll());
  useEffect(() => { cargar(); }, []);

  const handleSave = (data: FormTipo) => {
    if (editando) db.tiposTramite.update(editando.id, data);
    else db.tiposTramite.create(data);
    cargar();
    setModalOpen(false);
    setEditando(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tipos de Trámite</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tipos.length} tipo{tipos.length !== 1 ? 's' : ''} configurado{tipos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditando(null); setModalOpen(true); }} className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
          <Plus size={16} /> Nuevo tipo
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {tipos.length === 0 ? (
          <EmptyState icon={<Tag size={28} />} title="Sin tipos de trámite" description="Crea tipos de trámite para organizar el sistema." />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Nombre</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Descripción</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Días respuesta</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Acciones</th>
                </tr></thead>
                <tbody>
                  {tipos.map(t => (
                    <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{t.nombre}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground max-w-[240px] truncate">{t.descripcion || '-'}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          <Clock size={13} /> {t.diasRespuesta} día{t.diasRespuesta !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditando(t); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border">
              {tipos.map(t => (
                <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock size={11} /> {t.diasRespuesta} días de respuesta</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditando(t); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ModalTipo open={modalOpen} tipo={editando} onClose={() => { setModalOpen(false); setEditando(null); }} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { db.tiposTramite.delete(deleteId); setDeleteId(null); cargar(); } }} title="¿Eliminar tipo de trámite?" description="Los trámites existentes no se verán afectados." />
    </div>
  );
}
