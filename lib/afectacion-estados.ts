/** Valores de `estado` en trámites de afectación. */
export const AFECTACION_ESTADOS = [
  'Oficina',
  'Trabajando',
  'Observado',
  'Rechazado',
  'Resuelto',
] as const

export type AfectacionEstado = (typeof AFECTACION_ESTADOS)[number]

export function isAfectacionEstado(v: string): v is AfectacionEstado {
  return (AFECTACION_ESTADOS as readonly string[]).includes(v)
}

/** Fila destacada en tabla (misma lógica que Persona Jurídica). */
export function isAfectacionResueltoEstado(estado: string | null | undefined) {
  return (estado?.trim().toLowerCase() ?? '') === 'resuelto'
}
