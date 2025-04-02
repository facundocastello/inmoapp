import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Use x-forwarded-host instead of nextUrl.host
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Handle super admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Extract tenant identifier from subdomain or path
  let tenantId: string | null = null

  // Check for subdomain in development (localhost)
  const localhostMatch = host.match(/^([^.]+)\.localhost/)
  if (localhostMatch) {
    const subdomain = localhostMatch[1]
    if (subdomain !== 'www') {
      tenantId = subdomain
    }
  }
  // Check for subdomain in production
  else if (host.includes('.') && !host.startsWith('localhost')) {
    const subdomain = host.split('.')[0]
    if (subdomain !== 'www') {
      tenantId = subdomain
    }
  }

  // If no subdomain, check for tenant in path
  if (!tenantId) {
    const firstPathSegment = pathname.split('/')[1]
    if (firstPathSegment && firstPathSegment !== 'admin') {
      tenantId = firstPathSegment
    }
  }

  // If no tenant found, continue to landing page
  if (!tenantId) {
    return NextResponse.next()
  }

  // Rewrite the URL to use the tenant's route group
  const newUrl = new URL(request.url)

  if (tenantId) {
    // Remove tenant from path if it was in the path
    if (pathname.startsWith(`/${tenantId}`)) {
      newUrl.pathname = pathname.replace(`/${tenantId}`, '')
    }
    // Add tenant to the URL for routing
    newUrl.pathname = `/${tenantId}${newUrl.pathname}`
  }

  // Create response with tenant information
  const response = NextResponse.rewrite(newUrl)
  response.headers.set('x-tenant-id', tenantId)

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
