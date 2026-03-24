-- Tabla Recepción
CREATE TABLE IF NOT EXISTS recepcion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_ingreso DATE,
  apellido_nombre TEXT,
  direccion TEXT,
  telefono TEXT,
  tema TEXT,
  descripcion TEXT,
  estado TEXT DEFAULT 'Pendiente',
  observaciones TEXT,
  fecha_resolucion DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Persona Jurídica
CREATE TABLE IF NOT EXISTS persona_juridica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingreso DATE,
  legajo TEXT,
  expediente TEXT,
  denominacion TEXT,
  tramite TEXT,
  resolucion TEXT,
  fecha_resolucion DATE,
  observaciones TEXT,
  notificado BOOLEAN DEFAULT FALSE,
  representante TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Afectación
CREATE TABLE IF NOT EXISTS afectacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_ingreso DATE,
  expediente TEXT,
  afectante TEXT,
  link_documentacion TEXT,
  estado TEXT DEFAULT 'Pendiente',
  fecha_resolucion DATE,
  link_descarga TEXT,
  observaciones TEXT,
  notificado BOOLEAN DEFAULT FALSE,
  representante TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Ley Pierri
CREATE TABLE IF NOT EXISTS ley_pierri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_ingreso DATE,
  beneficiarios TEXT,
  direccion TEXT,
  telefono TEXT,
  observaciones TEXT,
  link_documentacion TEXT,
  estado TEXT DEFAULT 'Oficina',
  enviado BOOLEAN DEFAULT FALSE,
  fecha_envio DATE,
  escribania TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Recordatorios
CREATE TABLE IF NOT EXISTS recordatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_recordatorio DATE NOT NULL,
  tabla_origen TEXT,
  registro_id UUID,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_recepcion_estado ON recepcion(estado);
CREATE INDEX IF NOT EXISTS idx_recepcion_fecha ON recepcion(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_persona_juridica_expediente ON persona_juridica(expediente);
CREATE INDEX IF NOT EXISTS idx_afectacion_expediente ON afectacion(expediente);
CREATE INDEX IF NOT EXISTS idx_ley_pierri_estado ON ley_pierri(estado);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha ON recordatorios(fecha_recordatorio);
CREATE INDEX IF NOT EXISTS idx_recordatorios_completado ON recordatorios(completado);
