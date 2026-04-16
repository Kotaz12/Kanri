import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { db } from '@/data';
import { Dependencia } from '@/lib';
import { EmptyState, ConfirmDialog } from '@/components/UI';

interface FormDep { nombre: string; descripcion: string; }
const EMPTY: FormDep = { nombre: '', descripcion: '' };

function ModalDep({ open, dep, onClose, onSave }: { open: boolean; dep?: Dependencia | null; onClose: () => void; onSave: (d: FormDep) => void }) {
  const [form, setForm] = useState<FormDep>(EMPTY);
  const [errorNombre, setErrorNombre] = useState('');

  useEffect(() => {
    if (open) setForm(dep ? { nombre: dep.nombre, descripcion: dep.descripcion } : EMPTY);
    setErrorNombre('');
  }, [open, dep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setErrorNombre('Nombre requerido'); return; }
    onSave(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{dep ? 'Editar dependencia' : 'Nueva dependencia'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre <span className="text-destructive">*</span></label>
            <input value={form.nombre} onChange={e => { setForm(p => ({ ...p, nombre: e.target.value })); setErrorNombre(''); }} placeholder="Ej: Desarrollo Urbano" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errorNombre ? 'border-destructive' : 'border-input'}`} />
            {errorNombre && <p className="text-xs text-destructive mt-1">{errorNombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción de la dependencia" rows={2} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80">Cancelar</button>
            <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">{dep ? 'Guardar cambios' : 'Crear dependencia'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dependencias() {
  const [deps, setDeps] = useState<Dependencia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Dependencia | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cargar = () => setDeps(db.dependencias.getAll());
  useEffect(() => { cargar(); }, []);

  const handleSave = (data: FormDep) => {
    if (editando) db.dependencias.update(editando.id, data);
    else db.dependencias.create(data);
    cargar();
    setModalOpen(false);
    setEditando(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dependencias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{deps.length} dependencia{deps.length !== 1 ? 's' : ''} registrada{deps.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditando(null); setModalOpen(true); }} className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
          <Plus size={16} /> Nueva dependencia
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {deps.length === 0 ? (
          <EmptyState icon={<Building2 size={28} />} title="Sin dependencias" description="Registra dependencias para asignarlas a los trámites." />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Nombre</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Descripción</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Acciones</th>
                </tr></thead>
                <tbody>
                  {deps.map(d => (
                    <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 size={14} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{d.nombre}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground max-w-[300px] truncate">{d.descripcion || '-'}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditando(d); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(d.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border">
              {deps.map(d => (
                <div key={d.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Building2 size={14} className="text-primary" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.nombre}</p>
                      {d.descripcion && <p className="text-xs text-muted-foreground truncate">{d.descripcion}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditando(d); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(d.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ModalDep open={modalOpen} dep={editando} onClose={() => { setModalOpen(false); setEditando(null); }} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { db.dependencias.delete(deleteId); setDeleteId(null); cargar(); } }} title="¿Eliminar dependencia?" description="Los trámites existentes no se verán afectados." />
    </div>
  );
}
