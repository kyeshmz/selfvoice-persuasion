import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from './lib/prisma';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract participant ID
  const pathMatch = pathname.match(/^\/([^\/]+)\/(.+)$/);
  
  if (!pathMatch) {
    // Not a participant route, allow through
    return NextResponse.next();
  }
  
  const [, participantId, route] = pathMatch;
  
  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Fetch participant data using Prisma Accelerate (Edge Runtime compatible)
  let participant;
  try {
    participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        demographicsData: true,
      },
    });
  } catch (error) {
    console.error(`[Middleware] Error fetching participant ${participantId}:`, error);
    return NextResponse.next();
  }
  
  // If participant doesn't exist, allow through (let page handle it)
  if (!participant) {
    console.warn(`[Middleware] Participant ${participantId} not found`);
    return NextResponse.next();
  }
  
  // Transform participant data to match expected structure
  const participantData = {
    id: participant.id,
    consentGiven: participant.consentGiven,
    eligible: participant.eligible,
    hasDemographics: !!participant.demographicsData,
    hasAudioFile: !!participant.audioFile,
  };
  
  const specialRoutes = ['not-eligible', 'post', 'audio-chat'];
  if (specialRoutes.includes(route)) {
    return NextResponse.next();
  }
  
  // If participant is not eligible, redirect to not-eligible page (except for consent and gateway)
  if (!participantData.eligible && route !== 'consent' && route !== 'gateway') {
    return NextResponse.redirect(new URL(`/${participantId}/not-eligible`, request.url));
  }
  
  // Define route requirements
  const routeRequirements: Record<string, {
    consentGiven?: boolean;
    eligible?: boolean;
    hasDemographics?: boolean;
    hasAudioFile?: boolean;
    redirectTo?: string;
  }> = {
    'consent': {
      // No requirements - entry point
    },
    'gateway': {
      consentGiven: true,
      redirectTo: `/${participantId}/consent`,
    },
    'demographics': {
      consentGiven: true,
      eligible: true,
      redirectTo: !participantData.eligible
        ? `/${participantId}/not-eligible`
        : participantData.consentGiven 
        ? `/${participantId}/gateway` 
        : `/${participantId}/consent`,
    },
    'audio': {
      consentGiven: true,
      eligible: true,
      hasDemographics: true,
      redirectTo: !participantData.eligible
        ? `/${participantId}/not-eligible`
        : !participantData.consentGiven 
        ? `/${participantId}/consent`
        : !participantData.hasDemographics
        ? `/${participantId}/demographics`
        : `/${participantId}/demographics`,
    },
  };
  
  // Check if route is in requirements
  const requirements = routeRequirements[route];
  
  if (!requirements) {
    // Check against experiment ID
    if (route.match(/^[a-z0-9]+$/i)) {
      // Check all requirements
      if (
        !participantData.consentGiven ||
        !participantData.eligible ||
        !participantData.hasDemographics ||
        !participantData.hasAudioFile
      ) {
        // Redirect - if not eligible, always go to not-eligible
        const redirectPath = !participantData.eligible
          ? `/${participantId}/not-eligible`
          : !participantData.consentGiven
          ? `/${participantId}/consent`
          : !participantData.hasDemographics
          ? `/${participantId}/demographics`
          : `/${participantId}/audio`;
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  }
  
  // Check requirements for known routes
  const checks = {
    consentGiven: requirements.consentGiven !== undefined 
      ? participantData.consentGiven === requirements.consentGiven 
      : true,
    eligible: requirements.eligible !== undefined 
      ? participantData.eligible === requirements.eligible 
      : true,
    hasDemographics: requirements.hasDemographics !== undefined
      ? participantData.hasDemographics === requirements.hasDemographics
      : true,
    hasAudioFile: requirements.hasAudioFile !== undefined
      ? participantData.hasAudioFile === requirements.hasAudioFile
      : true,
  };
  
  // If all checks pass, allow through
  if (checks.consentGiven && checks.eligible && checks.hasDemographics && checks.hasAudioFile) {
    return NextResponse.next();
  }
  
  // Requirements not met, redirect to appropriate step
  const redirectPath = requirements.redirectTo || `/${participantId}/consent`;
  console.log(`[Middleware] Redirecting ${participantId} from /${route} to ${redirectPath}`, {
    consentGiven: participantData.consentGiven,
    eligible: participantData.eligible,
    hasDemographics: participantData.hasDemographics,
    hasAudioFile: participantData.hasAudioFile,
  });
  return NextResponse.redirect(new URL(redirectPath, request.url));
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

