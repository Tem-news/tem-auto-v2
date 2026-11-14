export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  // Vercel supplies this country from the visitor's public IP address.
  const country = request.headers.get('x-vercel-ip-country')
  return Response.json(
    { country: country && /^[a-z]{2}$/i.test(country) ? country.toLowerCase() : null },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
