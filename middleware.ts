import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_METHODS = 'GET,POST,PATCH,PUT,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization, x-user-id';

function withCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }), request);
  }

  return withCors(NextResponse.next(), request);
}

export const config = {
  matcher: '/api/:path*',
};
