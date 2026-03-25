import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

const AUTH_GET_USER_TIMEOUT_MS = Math.max(
  800,
  Number(process.env.SUPABASE_PROXY_AUTH_TIMEOUT_MS) || 2500,
)

function isLikelyTransientAuthFailure(msg: string) {
  const m = msg.toLowerCase()
  return (
    m.includes('fetch') ||
    m.includes('network') ||
    m.includes('timeout') ||
    m.includes('econnreset') ||
    m.includes('econnrefused') ||
    m.includes('tls') ||
    m.includes('socket') ||
    m.includes('failed to fetch') ||
    m.includes('auth getuser timeout')
  )
}

function errorChainMessage(e: unknown): string {
  if (!(e instanceof Error)) return String(e)
  const cause = e.cause
  if (cause instanceof Error) return `${e.message} · ${cause.message}`
  if (cause != null && typeof cause === 'object' && 'code' in cause) {
    return `${e.message} · ${String((cause as { code?: unknown }).code ?? '')}`
  }
  return e.message
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  let user: User | null = null
  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`auth getUser timeout (${AUTH_GET_USER_TIMEOUT_MS}ms)`)),
        AUTH_GET_USER_TIMEOUT_MS,
      )
    })

    const {
      data: { user: u },
      error,
    } = await Promise.race([
      supabase.auth.getUser().finally(() => {
        if (timeoutId !== undefined) clearTimeout(timeoutId)
      }),
      timeoutPromise,
    ])

    if (error) {
      if (isLikelyTransientAuthFailure(error.message)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[proxy] Supabase auth (transient), pass-through:', error.message)
        }
        return NextResponse.next({ request })
      }
      user = null
    } else {
      user = u ?? null
    }
  } catch (e) {
    const msg = errorChainMessage(e)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[proxy] Supabase auth.getUser — pass-through:', msg)
    }
    return NextResponse.next({ request })
  }

  const pathname = request.nextUrl.pathname
  const isPublicPath =
    pathname.startsWith('/auth/login') || pathname.startsWith('/auth/')
  const isApiPath = pathname.startsWith('/api/')

  if (!user && !isPublicPath && !isApiPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'

    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options)
    })

    return redirectResponse
  }

  return supabaseResponse
}
