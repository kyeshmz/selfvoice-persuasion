import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract participant ID from the path
  const pathParts = pathname.split('/');
  const participantId = pathParts[1];
  
  // Skip middleware for non-participant routes
  if (!participantId || pathParts.length < 3) {
    return NextResponse.next();
  }
  
  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip middleware for static files
  if (pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const currentPage = pathParts[2];
  
  try {
    // Fetch participant data
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });
    
    if (!participant) {
      // If participant doesn't exist, redirect to home or show error
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Define access rules
    const accessRules = {
      'consent': () => participant.audioCheckPassed === true,
      'demographics': () => participant.consentGiven === true,
      'audio': () => participant.demographics !== null && participant.demographics !== undefined
    };
    
    // Check if current page has access requirements
    if (currentPage in accessRules) {
      const hasAccess = accessRules[currentPage as keyof typeof accessRules]();
      
      if (!hasAccess) {
        // Determine where to redirect based on what's missing
        let redirectPath = `/${participantId}`;
        
        if (currentPage === 'consent' && !participant.audioCheckPassed) {
          redirectPath = `/${participantId}/pre-consent`;
        } else if (currentPage === 'demographics' && !participant.consentGiven) {
          redirectPath = `/${participantId}/consent`;
        } else if (currentPage === 'audio' && (!participant.demographics || participant.demographics === null)) {
          redirectPath = `/${participantId}/demographics`;
        }
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
    
    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to proceed
    return NextResponse.next();
  }
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
};
