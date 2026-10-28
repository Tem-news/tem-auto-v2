import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const COOKIE = 'temauto-visitor'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function database() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET() {
  const { data, error } = await database().rpc('temauto_visit_stats')
  return NextResponse.json(error ? { error: 'Statistics unavailable' } : data, {
    status: error ? 503 : 200, headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const previous = request.cookies.get(COOKIE)?.value
  const visitor = previous && UUID.test(previous) ? previous : randomUUID()
  const country = request.headers.get('x-vercel-ip-country')?.toLowerCase()
  const { data, error } = await database().rpc('temauto_record_visit', {
    p_visitor_id: visitor, p_country: country && /^[a-z]{2}$/.test(country) ? country : null,
  })
  const response = NextResponse.json(error ? { error: 'Statistics unavailable' } : data, {
    status: error ? 503 : 200, headers: { 'Cache-Control': 'private, no-store' },
  })
  if (!error) response.cookies.set(COOKIE, visitor, {
    httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60, path: '/',
  })
  return response
}
