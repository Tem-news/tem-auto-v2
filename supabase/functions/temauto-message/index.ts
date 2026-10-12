export {}
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (request: Request) => Promise<Response>): void }

Deno.serve(async request => {
  const origin = request.headers.get('origin') || ''
  const allowed = !origin || origin === 'https://tem-auto-v2-zc4n.vercel.app' ||
    /^https:\/\/tem-auto-v2-zc4n-[a-z0-9-]+-tem-news1\.vercel\.app$/.test(origin)
  const headers = { 'Access-Control-Allow-Origin': origin || '*', 'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  const reply = (status: number, result: object) => new Response(JSON.stringify(result), { status, headers })
  if (!allowed) return new Response('Forbidden', { status: 403 })
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  if (request.method !== 'POST') return reply(405, { ok: false })
  try {
    if (Number(request.headers.get('content-length') || 0) > 65000) return reply(413, { ok: false })
    const reader = request.body?.getReader()
    if (!reader) return reply(400, { ok: false })
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const part = await reader.read()
      if (part.done) break
      size += part.value.length
      if (size > 65000) { await reader.cancel(); return reply(413, { ok: false }) }
      chunks.push(part.value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    if (payload.website) return reply(200, { ok: true })
    const category = payload.category
    const body = typeof payload.body === 'string' ? payload.body.trim() : ''
    const email = typeof payload.email === 'string' ? payload.email.trim() : ''
    const listing = typeof payload.listing_url === 'string' ? payload.listing_url.trim() : ''
    const language = typeof payload.language === 'string' ? payload.language.toUpperCase() : 'LV'
    const country = typeof payload.country === 'string' ? payload.country : null
    if (!['suggestions','advertising','legal','reports'].includes(category) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id || '') ||
      body.length < 3 || body.length > 10000 || email.length > 254 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      listing.length > 2048 || language.length < 2 || language.length > 8 ||
      (country && country.length > 160)) return reply(400, { ok: false })
    if (listing) {
      try { const url = new URL(listing); if (!['https:','http:'].includes(url.protocol) || url.username || url.password) return reply(400, { ok: false }) }
      catch { return reply(400, { ok: false }) }
    }
    const url = Deno.env.get('SUPABASE_URL')!
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!url || !key) return reply(503, { ok: false })
    let userId: string | null = null
    const auth = request.headers.get('authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (token && token !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const response = await fetch(url + '/auth/v1/user', { headers: { apikey: key, Authorization: auth } })
      if (!response.ok) return reply(401, { ok: false })
      const user = await response.json()
      userId = user.id
    }
    const address = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const signingKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name:'HMAC',hash:'SHA-256' }, false, ['sign'])
    const signature = await crypto.subtle.sign('HMAC', signingKey, new TextEncoder().encode(address))
    const fingerprint = Array.from(new Uint8Array(signature), n => n.toString(16).padStart(2,'0')).join('')
    const response = await fetch(url + '/rest/v1/rpc/temauto_submit_message', {
      method:'POST', headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({p_id:payload.id,p_category:category,p_body:body,p_email:email,p_listing_url:listing,
        p_sender_user_id:userId,p_language:language,p_country:country,p_fingerprint:fingerprint})
    })
    if (!response.ok) return reply(503, { ok: false })
    if (await response.json() !== true) return reply(429, { ok: false, code: 'rate_limit' })
    return reply(200, { ok: true })
  } catch { return reply(400, { ok: false }) }
})
