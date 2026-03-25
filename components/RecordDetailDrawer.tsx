'use client'

import * as React from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { formatDateDdMmYyyy } from '@/lib/format-date'

export type DetailRow = { label: string; value: React.ReactNode }

export function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return formatDateDdMmYyyy(value)
  }
  return String(value)
}

export function detailLink(url: string | null | undefined): React.ReactNode {
  const u = url?.trim()
  if (!u) return '—'
  return (
    <a
      href={u}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 break-all"
      onClick={(e) => e.stopPropagation()}
    >
      {u}
    </a>
  )
}

export function RecordDetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  rows,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  rows: DetailRow[]
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right" shouldScaleBackground={false}>
      <DrawerContent
        className={
          'data-[vaul-drawer-direction=right]:!max-w-lg data-[vaul-drawer-direction=right]:w-full ' +
          'data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:max-h-screen ' +
          'flex flex-col gap-0 p-0'
        }
      >
        <DrawerHeader className="relative shrink-0 border-b border-border px-4 pb-4 pt-6 text-left">
          <DrawerClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
          <DrawerTitle className="pr-10 text-lg font-semibold leading-tight">{title}</DrawerTitle>
          {description ? (
            <DrawerDescription className="text-muted-foreground">{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <dl className="space-y-4">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm text-foreground break-words whitespace-pre-wrap">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <DrawerFooter className="shrink-0 border-t border-border">
          <DrawerClose asChild>
            <Button type="button" variant="secondary" className="w-full">
              Cerrar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
