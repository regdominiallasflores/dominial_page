/** Valores permitidos para el campo `estado` en Ley Pierri. */
export const LEY_PIERRI_ESTADOS = ['Oficina', 'Planeamiento', 'Escribania'] as const

export type LeyPierriEstado = (typeof LEY_PIERRI_ESTADOS)[number]

export function isLeyPierriEstado(v: string): v is LeyPierriEstado {
  return (LEY_PIERRI_ESTADOS as readonly string[]).includes(v)
}

/** Valores permitidos para el campo `escribania` en Ley Pierri. */
export const LEY_PIERRI_ESCRIBANIAS = ['Escribania Canosa', 'Escribania Fernandez'] as const

export type LeyPierriEscribania = (typeof LEY_PIERRI_ESCRIBANIAS)[number]

export function isLeyPierriEscribania(v: string): v is LeyPierriEscribania {
  return (LEY_PIERRI_ESCRIBANIAS as readonly string[]).includes(v)
}

/** Estado «Escribania»: la fila se resalta y ordena al final (como «Resuelto» en otras tablas). */
export function isLeyPierriEscribaniaEstadoRow(estado: string | null | undefined) {
  return (estado?.trim() ?? '') === 'Escribania'
}

/** Carpeta compartida de planillas (Google Drive). */
export const LEY_PIERRI_PLANILLAS_DRIVE_URL =
  'https://drive.google.com/drive/folders/1uYgI28Nr1NsQCfKg7B8RIN5QESTvMDff?usp=sharing'
