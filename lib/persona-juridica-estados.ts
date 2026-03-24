/** Valores permitidos para el campo `resolucion` (pantalla: Estado) en persona jurídica. */
export const PERSONA_JURIDICA_ESTADOS = [
  'Iniciado',
  'Observado',
  'Archivado',
  'Resuelto',
] as const

export type PersonaJuridicaEstado = (typeof PERSONA_JURIDICA_ESTADOS)[number]

export function isPersonaJuridicaEstado(v: string): v is PersonaJuridicaEstado {
  return (PERSONA_JURIDICA_ESTADOS as readonly string[]).includes(v)
}
