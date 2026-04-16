import {
  Usuario,
  TipoTramite,
  Dependencia,
  Cliente,
  Tramite,
  Nota,
  Notificacion,
  generateId,
  calcularFechaLimite,
  calcularEstatus,
  crearToken,
} from '@/lib';

// ============================================================
// DATOS INICIALES
// ============================================================

const HOY = new Date().toISOString().split('T')[0];

function diasAtras(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().split('T')[0];
}

export function inicializarDatos() {
  if (localStorage.getItem('kanri_inicializado')) return;

  // Usuario admin
  const adminId = generateId();
  const usuarios: Usuario[] = [
    {
      id: adminId,
      nombre: 'Administrador',
      email: 'admin@tramites.com',
      password: 'admin123',
      rol: 'Administrador',
      createdAt: HOY,
    },
  ];

  // Tipos de trámite
  const tipos: TipoTramite[] = [
    { id: generateId(), nombre: 'Licencia de Construcción', descripcion: 'Trámite para obtener licencia de construcción', diasRespuesta: 15, createdAt: HOY },
    { id: generateId(), nombre: 'Permiso de Uso de Suelo', descripcion: 'Permiso para uso de suelo comercial o habitacional', diasRespuesta: 10, createdAt: HOY },
    { id: generateId(), nombre: 'Constancia de No Adeudo', descripcion: 'Constancia que acredita no tener adeudos', diasRespuesta: 3, createdAt: HOY },
  ];

  // Dependencias
  const dependencias: Dependencia[] = [
    { id: generateId(), nombre: 'Desarrollo Urbano', descripcion: 'Dirección de Desarrollo Urbano y Obras Públicas', createdAt: HOY },
    { id: generateId(), nombre: 'Catastro', descripcion: 'Dirección de Catastro Municipal', createdAt: HOY },
    { id: generateId(), nombre: 'Tesorería', descripcion: 'Tesorería Municipal', createdAt: HOY },
  ];

  // Clientes de ejemplo
  const clientes: Cliente[] = [
    { id: generateId(), nombre: 'Juan García López', email: 'juan@email.com', telefono: '555-1234', direccion: 'Calle Principal 123', createdAt: HOY },
    { id: generateId(), nombre: 'María Hernández Pérez', email: 'maria@email.com', telefono: '555-5678', direccion: 'Av. Reforma 456', createdAt: HOY },
    { id: generateId(), nombre: 'Carlos Martínez Ruiz', email: 'carlos@email.com', telefono: '555-9012', direccion: 'Blvd. Norte 789', createdAt: HOY },
  ];

  // Trámites de ejemplo
  const tramite1Id = generateId();
  const tramite2Id = generateId();
  const tramite3Id = generateId();
  const tramite4Id = generateId();

  const fechaIngreso1 = diasAtras(10);
  const fechaIngreso2 = diasAtras(8);
  const fechaIngreso3 = diasAtras(2);
  const fechaIngreso4 = diasAtras(20);

  const fl1 = calcularFechaLimite(fechaIngreso1, tipos[0].diasRespuesta); // vence en 5 días
  const fl2 = calcularFechaLimite(fechaIngreso2, tipos[1].diasRespuesta); // vence en 2 días
  const fl3 = calcularFechaLimite(fechaIngreso3, tipos[2].diasRespuesta); // ya venció
  const fl4 = calcularFechaLimite(fechaIngreso4, tipos[0].diasRespuesta); // completado

  const tramites: Tramite[] = [
    {
      id: tramite1Id,
      titulo: 'Licencia para construcción residencial',
      descripcion: 'Solicitud de licencia para construir casa habitación de dos plantas',
      clienteId: clientes[0].id,
      tipoTramiteId: tipos[0].id,
      dependenciaId: dependencias[0].id,
      responsable: 'Empleado',
      empleadoAsignadoId: adminId,
      fechaIngreso: fechaIngreso1,
      fechaLimite: fl1,
      estatus: calcularEstatus(fl1),
      createdAt: fechaIngreso1,
      updatedAt: fechaIngreso1,
    },
    {
      id: tramite2Id,
      titulo: 'Permiso uso de suelo comercial',
      descripcion: 'Permiso para instalar local comercial en planta baja',
      clienteId: clientes[1].id,
      tipoTramiteId: tipos[1].id,
      dependenciaId: dependencias[0].id,
      responsable: 'Cliente',
      fechaIngreso: fechaIngreso2,
      fechaLimite: fl2,
      estatus: calcularEstatus(fl2),
      createdAt: fechaIngreso2,
      updatedAt: fechaIngreso2,
    },
    {
      id: tramite3Id,
      titulo: 'Constancia de no adeudo predial',
      descripcion: 'Constancia para trámite notarial de compraventa',
      clienteId: clientes[2].id,
      tipoTramiteId: tipos[2].id,
      dependenciaId: dependencias[2].id,
      responsable: 'Empleado',
      empleadoAsignadoId: adminId,
      fechaIngreso: fechaIngreso3,
      fechaLimite: fl3,
      estatus: calcularEstatus(fl3),
      createdAt: fechaIngreso3,
      updatedAt: fechaIngreso3,
    },
    {
      id: tramite4Id,
      titulo: 'Licencia ampliación de bodega',
      descripcion: 'Licencia para ampliar instalación industrial existente',
      clienteId: clientes[0].id,
      tipoTramiteId: tipos[0].id,
      dependenciaId: dependencias[1].id,
      responsable: 'Empleado',
      empleadoAsignadoId: adminId,
      fechaIngreso: fechaIngreso4,
      fechaLimite: fl4,
      estatus: 'completado',
      createdAt: fechaIngreso4,
      updatedAt: HOY,
    },
  ];

  // Notas de ejemplo
  const notas: Nota[] = [
    {
      id: generateId(),
      tramiteId: tramite1Id,
      contenido: 'Se recibió documentación completa. Pendiente revisión técnica.',
      autorId: adminId,
      autorNombre: 'Administrador',
      createdAt: diasAtras(9),
    },
    {
      id: generateId(),
      tramiteId: tramite1Id,
      contenido: 'Revisión técnica aprobada. En proceso de firma.',
      autorId: adminId,
      autorNombre: 'Administrador',
      createdAt: diasAtras(3),
    },
    {
      id: generateId(),
      tramiteId: tramite3Id,
      contenido: 'Cliente notificado del vencimiento. Requiere actualización de documentos.',
      autorId: adminId,
      autorNombre: 'Administrador',
      createdAt: HOY,
    },
  ];

  // Notificaciones de ejemplo
  const notificaciones: Notificacion[] = [
    {
      id: generateId(),
      tipo: 'nuevo_tramite',
      titulo: 'Nuevo trámite registrado',
      mensaje: `Se creó el trámite: ${tramites[0].titulo}`,
      tramiteId: tramite1Id,
      leida: false,
      createdAt: fechaIngreso1,
    },
    {
      id: generateId(),
      tipo: 'nuevo_tramite',
      titulo: 'Nuevo trámite registrado',
      mensaje: `Se creó el trámite: ${tramites[1].titulo}`,
      tramiteId: tramite2Id,
      leida: false,
      createdAt: fechaIngreso2,
    },
    {
      id: generateId(),
      tipo: 'nota_agregada',
      titulo: 'Nueva nota en trámite',
      mensaje: `Se agregó una nota en: ${tramites[0].titulo}`,
      tramiteId: tramite1Id,
      leida: true,
      createdAt: diasAtras(3),
    },
  ];

  // Guardar en localStorage
  localStorage.setItem('kanri_usuarios', JSON.stringify(usuarios));
  localStorage.setItem('kanri_tipos_tramite', JSON.stringify(tipos));
  localStorage.setItem('kanri_dependencias', JSON.stringify(dependencias));
  localStorage.setItem('kanri_clientes', JSON.stringify(clientes));
  localStorage.setItem('kanri_tramites', JSON.stringify(tramites));
  localStorage.setItem('kanri_notas', JSON.stringify(notas));
  localStorage.setItem('kanri_notificaciones', JSON.stringify(notificaciones));
  localStorage.setItem('kanri_inicializado', 'true');
}

// ============================================================
// FUNCIONES DE ACCESO A DATOS
// ============================================================

function getItem<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Usuarios
export const db = {
  usuarios: {
    getAll: (): Usuario[] => getItem<Usuario>('kanri_usuarios'),
    getById: (id: string): Usuario | undefined => getItem<Usuario>('kanri_usuarios').find(u => u.id === id),
    getByEmail: (email: string): Usuario | undefined => getItem<Usuario>('kanri_usuarios').find(u => u.email === email),
    create: (u: Omit<Usuario, 'id' | 'createdAt'>): Usuario => {
      const nuevo: Usuario = { ...u, id: generateId(), createdAt: new Date().toISOString() };
      const lista = getItem<Usuario>('kanri_usuarios');
      lista.push(nuevo);
      setItem('kanri_usuarios', lista);
      return nuevo;
    },
    update: (id: string, data: Partial<Usuario>): Usuario | null => {
      const lista = getItem<Usuario>('kanri_usuarios');
      const idx = lista.findIndex(u => u.id === id);
      if (idx === -1) return null;
      lista[idx] = { ...lista[idx], ...data };
      setItem('kanri_usuarios', lista);
      return lista[idx];
    },
    delete: (id: string): boolean => {
      const lista = getItem<Usuario>('kanri_usuarios').filter(u => u.id !== id);
      setItem('kanri_usuarios', lista);
      return true;
    },
  },

  tiposTramite: {
    getAll: (): TipoTramite[] => getItem<TipoTramite>('kanri_tipos_tramite'),
    getById: (id: string): TipoTramite | undefined => getItem<TipoTramite>('kanri_tipos_tramite').find(t => t.id === id),
    create: (t: Omit<TipoTramite, 'id' | 'createdAt'>): TipoTramite => {
      const nuevo: TipoTramite = { ...t, id: generateId(), createdAt: new Date().toISOString() };
      const lista = getItem<TipoTramite>('kanri_tipos_tramite');
      lista.push(nuevo);
      setItem('kanri_tipos_tramite', lista);
      return nuevo;
    },
    update: (id: string, data: Partial<TipoTramite>): TipoTramite | null => {
      const lista = getItem<TipoTramite>('kanri_tipos_tramite');
      const idx = lista.findIndex(t => t.id === id);
      if (idx === -1) return null;
      lista[idx] = { ...lista[idx], ...data };
      setItem('kanri_tipos_tramite', lista);
      return lista[idx];
    },
    delete: (id: string): boolean => {
      setItem('kanri_tipos_tramite', getItem<TipoTramite>('kanri_tipos_tramite').filter(t => t.id !== id));
      return true;
    },
  },

  dependencias: {
    getAll: (): Dependencia[] => getItem<Dependencia>('kanri_dependencias'),
    getById: (id: string): Dependencia | undefined => getItem<Dependencia>('kanri_dependencias').find(d => d.id === id),
    create: (d: Omit<Dependencia, 'id' | 'createdAt'>): Dependencia => {
      const nuevo: Dependencia = { ...d, id: generateId(), createdAt: new Date().toISOString() };
      const lista = getItem<Dependencia>('kanri_dependencias');
      lista.push(nuevo);
      setItem('kanri_dependencias', lista);
      return nuevo;
    },
    update: (id: string, data: Partial<Dependencia>): Dependencia | null => {
      const lista = getItem<Dependencia>('kanri_dependencias');
      const idx = lista.findIndex(d => d.id === id);
      if (idx === -1) return null;
      lista[idx] = { ...lista[idx], ...data };
      setItem('kanri_dependencias', lista);
      return lista[idx];
    },
    delete: (id: string): boolean => {
      setItem('kanri_dependencias', getItem<Dependencia>('kanri_dependencias').filter(d => d.id !== id));
      return true;
    },
  },

  clientes: {
    getAll: (): Cliente[] => getItem<Cliente>('kanri_clientes'),
    getById: (id: string): Cliente | undefined => getItem<Cliente>('kanri_clientes').find(c => c.id === id),
    create: (c: Omit<Cliente, 'id' | 'createdAt'>): Cliente => {
      const nuevo: Cliente = { ...c, id: generateId(), createdAt: new Date().toISOString() };
      const lista = getItem<Cliente>('kanri_clientes');
      lista.push(nuevo);
      setItem('kanri_clientes', lista);
      return nuevo;
    },
    update: (id: string, data: Partial<Cliente>): Cliente | null => {
      const lista = getItem<Cliente>('kanri_clientes');
      const idx = lista.findIndex(c => c.id === id);
      if (idx === -1) return null;
      lista[idx] = { ...lista[idx], ...data };
      setItem('kanri_clientes', lista);
      return lista[idx];
    },
    delete: (id: string): boolean => {
      setItem('kanri_clientes', getItem<Cliente>('kanri_clientes').filter(c => c.id !== id));
      return true;
    },
  },

  tramites: {
    getAll: (): Tramite[] => {
      const lista = getItem<Tramite>('kanri_tramites');
      return lista.map(t => ({
        ...t,
        estatus: t.estatus === 'completado' ? 'completado' : calcularEstatus(t.fechaLimite),
      }));
    },
    getById: (id: string): Tramite | undefined => {
      const t = getItem<Tramite>('kanri_tramites').find(t => t.id === id);
      if (!t) return undefined;
      return { ...t, estatus: t.estatus === 'completado' ? 'completado' : calcularEstatus(t.fechaLimite) };
    },
    create: (t: Omit<Tramite, 'id' | 'createdAt' | 'updatedAt' | 'estatus'>): Tramite => {
      const nuevo: Tramite = {
        ...t,
        id: generateId(),
        estatus: calcularEstatus(t.fechaLimite),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const lista = getItem<Tramite>('kanri_tramites');
      lista.push(nuevo);
      setItem('kanri_tramites', lista);
      // Crear notificación
      const tipo = db.tiposTramite.getById(t.tipoTramiteId);
      db.notificaciones.create({
        tipo: 'nuevo_tramite',
        titulo: 'Nuevo trámite registrado',
        mensaje: `Se creó el trámite: ${t.titulo}${tipo ? ` (${tipo.nombre})` : ''}`,
        tramiteId: nuevo.id,
        leida: false,
      });
      return nuevo;
    },
    update: (id: string, data: Partial<Tramite>): Tramite | null => {
      const lista = getItem<Tramite>('kanri_tramites');
      const idx = lista.findIndex(t => t.id === id);
      if (idx === -1) return null;
      lista[idx] = { ...lista[idx], ...data, updatedAt: new Date().toISOString() };
      setItem('kanri_tramites', lista);
      return lista[idx];
    },
    delete: (id: string): boolean => {
      setItem('kanri_tramites', getItem<Tramite>('kanri_tramites').filter(t => t.id !== id));
      return true;
    },
  },

  notas: {
    getByTramite: (tramiteId: string): Nota[] =>
      getItem<Nota>('kanri_notas').filter(n => n.tramiteId === tramiteId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    create: (n: Omit<Nota, 'id' | 'createdAt'>): Nota => {
      const nueva: Nota = { ...n, id: generateId(), createdAt: new Date().toISOString() };
      const lista = getItem<Nota>('kanri_notas');
      lista.push(nueva);
      setItem('kanri_notas', lista);
      // Crear notificación
      const tramite = db.tramites.getById(n.tramiteId);
      if (tramite) {
        db.notificaciones.create({
          tipo: 'nota_agregada',
          titulo: 'Nueva nota en trámite',
          mensaje: `${n.autorNombre} agregó una nota en: ${tramite.titulo}`,
          tramiteId: n.tramiteId,
          leida: false,
        });
      }
      return nueva;
    },
    delete: (id: string): boolean => {
      setItem('kanri_notas', getItem<Nota>('kanri_notas').filter(n => n.id !== id));
      return true;
    },
  },

  notificaciones: {
    getAll: (): Notificacion[] =>
      getItem<Notificacion>('kanri_notificaciones').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    getNoLeidas: (): number => getItem<Notificacion>('kanri_notificaciones').filter(n => !n.leida).length,
    create: (n: Omit<Notificacion, 'id' | 'createdAt'>): Notificacion => {
      const nueva: Notificacion = { ...n, id: generateId(), createdAt: new Date().toISOString() };
      const lista = getItem<Notificacion>('kanri_notificaciones');
      lista.push(nueva);
      setItem('kanri_notificaciones', lista);
      return nueva;
    },
    marcarLeida: (id: string): void => {
      const lista = getItem<Notificacion>('kanri_notificaciones');
      const idx = lista.findIndex(n => n.id === id);
      if (idx !== -1) { lista[idx].leida = true; setItem('kanri_notificaciones', lista); }
    },
    marcarTodasLeidas: (): void => {
      const lista = getItem<Notificacion>('kanri_notificaciones').map(n => ({ ...n, leida: true }));
      setItem('kanri_notificaciones', lista);
    },
  },

  auth: {
    login: (email: string, password: string): { token: string; usuario: Usuario } | null => {
      const usuario = db.usuarios.getByEmail(email);
      if (!usuario || usuario.password !== password) return null;
      const { password: _p, ...userSafe } = usuario;
      const token = crearToken({ id: usuario.id, email: usuario.email, nombre: usuario.nombre });
      return { token, usuario: userSafe as Usuario };
    },
    registro: (nombre: string, email: string, password: string): { token: string; usuario: Usuario } | null => {
      if (db.usuarios.getByEmail(email)) return null;
      const usuario = db.usuarios.create({ nombre, email, password, rol: 'Usuario' });
      const { password: _p, ...userSafe } = usuario;
      const token = crearToken({ id: usuario.id, email: usuario.email, nombre: usuario.nombre });
      return { token, usuario: userSafe as Usuario };
    },
  },
};
