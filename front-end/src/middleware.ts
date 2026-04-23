import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lefxy_token')?.value;

  // Rotas que não precisam de autenticação
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    // Redireciona para o login se não tiver token e tentar acessar rota restrita
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    // Redireciona para a home se já tiver token e tentar acessar o login
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
