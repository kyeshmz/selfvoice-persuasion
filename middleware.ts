import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
  
    const pathParts = pathname.split('/');
    const participantId = pathParts[1];
  
    // Skip middleware for non-participant routes
    if (!participantId || pathParts.length < 3) {
      return NextResponse.next();
    }
  
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
  
    if (pathname.includes('.')) {
      return NextResponse.next();
    }
  
  // Get the current page
    const currentPage = pathParts[2];
  
  
  // Fetch participant data
    const apiRes = await fetch(new URL(`/api/${participantId}`, request.nextUrl.origin).toString());
    const data = await apiRes.json();
    let participant = data.participant;
    
    // If participant not found, redirect to home page
    if (!participant) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Define access rules
    const accessRules = {
      'consent': () => participant.audioCheckPassed === true,
      'demographics': () => participant.consentGiven === true,
      'audio': () => {
        if (participant.demographics === null || participant.demographics === undefined) {
          return false;
        }
        return Object.values(participant.demographics).every(
          (value) => value !== ""
        );
      }
    };
    
    // Check if current page has access requirements
    if (currentPage in accessRules) {
      const hasAccess = accessRules[currentPage as keyof typeof accessRules]();
      
      if (!hasAccess) {
        let redirectPath = `/${participantId}`;
        
        if (currentPage === 'consent') {
          redirectPath = `/${participantId}/pre-consent`;
        } else if (currentPage === 'demographics') {
          redirectPath = `/${participantId}/consent`;
        } else if (currentPage === 'audio' ) {
          redirectPath = `/${participantId}/demographics`;
        }
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
    
    return NextResponse.next();
    
  
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
