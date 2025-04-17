import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Use x-forwarded-host instead of nextUrl.host
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  if (host.includes('devtunnels.ms') || host.includes('vercel.app')) {
    const response = NextResponse.next()
    const tenantSubdomain = pathname.split('/')[1]
    if (tenantSubdomain)
      response.headers.set('x-tenant-subdomain', tenantSubdomain)
    return response
  }

  // Handle WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', '*')
    return response
  }

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('webpack-hmr')
  ) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }

  // Extract tenant identifier from subdomain or path
  let tenantSubdomain: string | null = null

  // Check for subdomain in development (localhost)
  const localhostMatch = host.match(/^([^.]+)\.localhost/)
  if (localhostMatch) {
    const subdomain = localhostMatch[1]
    if (subdomain !== 'www') {
      tenantSubdomain = subdomain
    }
  }
  // Check for subdomain in production
  else if (host.includes('.') && !host.startsWith('localhost')) {
    // Parse the hostname properly to identify subdomains
    const hostParts = host.split('.')

    // Only consider it a subdomain if we have at least 3 parts (subdomain.domain.tld)
    // or if the first part is 'www' in a two-part domain (www.domain.tld)
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0]
      if (subdomain !== 'www') {
        tenantSubdomain = subdomain
      }
    }
  }

  // If no subdomain, check for tenant in path
  if (!tenantSubdomain) {
    const firstPathSegment = pathname.split('/')[1]
    if (firstPathSegment && firstPathSegment !== 'admin') {
      tenantSubdomain = firstPathSegment
    }
  }

  // If no tenant found, continue to landing page
  if (!tenantSubdomain) {
    return NextResponse.next()
  }

  // Rewrite the URL to use the tenant's route group
  const newUrl = new URL(request.url)

  if (tenantSubdomain) {
    // Remove tenant from path if it was in the path
    if (pathname.startsWith(`/${tenantSubdomain}`)) {
      newUrl.pathname = pathname.replace(`/${tenantSubdomain}`, '')
    }
    // Add tenant to the URL for routing
    newUrl.pathname = `/${tenantSubdomain}${newUrl.pathname}`
  }

  // Create response with tenant information
  const response = NextResponse.rewrite(newUrl)
  if (tenantSubdomain)
    response.headers.set('x-tenant-subdomain', tenantSubdomain)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
