import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { db } from '@/data';
import { Cliente, generateId } from '@/lib';
import { EmptyState, ConfirmDialog } from '@/components/UI';

interface FormCliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

const EMPTY: FormCliente = { nombre: '', email: '', telefono: '', direccion: '' };

function ModalCliente({
  open, cliente, onClose, onSave,
}: {
  open: boolean;
  cliente?: Cliente | null;
  onClose: () => void;
  onSave: (data: FormCliente) => void;
}) {
  const [form, setForm] = useState<FormCliente>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormCliente>>({});

  useEffect(() => {
    if (open) setForm(cliente ? { nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono, direccion: cliente.direccion } : EMPTY);
    setErrors({});
  }, [open, cliente]);

  const set = (k: keyof FormCliente, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = (): boolean => {
    const e: Partial<FormCliente> = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.email.trim()) e.email = 'Correo requerido';
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
          <h2 className="text-base font-semibold text-foreground">{cliente ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre <span className="text-destructive">*</span></label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre completo" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.nombre ? 'border-destructive' : 'border-input'}`} />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Correo <span className="text-destructive">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@email.com" className={`w-full h-10 px-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? 'border-destructive' : 'border-input'}`} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
            <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="555-1234" className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Dirección</label>
            <input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Calle y número" className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">Cancelar</button>
            <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">{cliente ? 'Guardar cambios' : 'Crear cliente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cargar = () => setClientes(db.clientes.getAll());
  useEffect(() => { cargar(); }, []);

  const handleSave = (data: FormCliente) => {
    if (editando) {
      db.clientes.update(editando.id, data);
    } else {
      db.clientes.create(data);
    }
    cargar();
    setModalOpen(false);
    setEditando(null);
  };

  const handleEliminar = () => {
    if (!deleteId) return;
    db.clientes.delete(deleteId);
    setDeleteId(null);
    cargar();
  };

  const filtrados = clientes.filter(c =>
    !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditando(null); setModalOpen(true); }} className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar clientes..." className="w-full h-9 pl-9 pr-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="Sin clientes" description="Agrega clientes para asignarlos a los trámites." action={<button onClick={() => { setEditando(null); setModalOpen(true); }} className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Nuevo cliente</button>} />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Nombre</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Correo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Teléfono</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Dirección</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Acciones</th>
                </tr></thead>
                <tbody>
                  {filtrados.map(c => (
                    <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{c.nombre}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">{c.email}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">{c.telefono || '-'}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground max-w-[180px] truncate">{c.direccion || '-'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditando(c); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border">
              {filtrados.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                    {c.telefono && <p className="text-xs text-muted-foreground">{c.telefono}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditando(c); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ModalCliente open={modalOpen} cliente={editando} onClose={() => { setModalOpen(false); setEditando(null); }} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={handleEliminar} title="¿Eliminar cliente?" description="Se eliminará el cliente del sistema." />
    </div>
  );
}
