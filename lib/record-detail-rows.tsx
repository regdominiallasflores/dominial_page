import type { DetailRow } from '@/components/RecordDetailDrawer'
import { detailLink, formatDetailValue } from '@/components/RecordDetailDrawer'

export function getSearchDetailRows(
  table: string,
  record: Record<string, unknown>,
): DetailRow[] {
  switch (table) {
    case 'recepcion':
      return recepcionRows(record)
    case 'persona_juridica':
      return personaJuridicaRows(record)
    case 'afectacion':
      return afectacionRows(record)
    case 'ley_pierri':
      return leyPierriRows(record)
    default:
      return Object.entries(record)
        .filter(([k]) => k !== 'id')
        .map(([k, v]) => ({ label: k, value: formatDetailValue(v) }))
  }
}

function recepcionRows(r: Record<string, unknown>): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Apellido y nombre', value: formatDetailValue(r.apellido_nombre) },
    { label: 'Dirección', value: formatDetailValue(r.direccion) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Tema', value: formatDetailValue(r.tema) },
    { label: 'Descripción', value: formatDetailValue(r.descripcion) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
  ]
}

function personaJuridicaRows(r: Record<string, unknown>): DetailRow[] {
  return [
    { label: 'Ingreso', value: formatDetailValue(r.ingreso) },
    { label: 'Legajo', value: formatDetailValue(r.legajo) },
    { label: 'Expediente', value: formatDetailValue(r.expediente) },
    { label: 'Denominación', value: formatDetailValue(r.denominacion) },
    { label: 'Trámite', value: formatDetailValue(r.tramite) },
    { label: 'Documentación', value: detailLink(r.link_documentacion as string | undefined) },
    { label: 'Ubicación', value: formatDetailValue(r.ubicacion) },
    { label: 'Estado', value: formatDetailValue(r.resolucion) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Notificado', value: formatDetailValue(r.notificado) },
    { label: 'Representante', value: formatDetailValue(r.representante) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
  ]
}

function afectacionRows(r: Record<string, unknown>): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Expediente', value: formatDetailValue(r.expediente) },
    { label: 'Afectante', value: formatDetailValue(r.afectante) },
    { label: 'Documentación', value: detailLink(r.link_documentacion as string | undefined) },
    { label: 'Ubicación', value: formatDetailValue(r.ubicacion) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
    { label: 'Enlace de descarga', value: detailLink(r.link_descarga as string | undefined) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Notificado', value: formatDetailValue(r.notificado) },
    { label: 'Representante', value: formatDetailValue(r.representante) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
  ]
}

function leyPierriRows(r: Record<string, unknown>): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Beneficiarios', value: formatDetailValue(r.beneficiarios) },
    { label: 'Dirección', value: formatDetailValue(r.direccion) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Documentación', value: detailLink(r.link_documentacion as string | undefined) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Escribanía', value: formatDetailValue(r.escribania) },
  ]
}
