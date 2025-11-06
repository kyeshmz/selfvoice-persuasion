import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const prolificPid = url.searchParams.get('PROLIFIC_PID');
  const studyId = url.searchParams.get('STUDY_ID');
  const sessionId = url.searchParams.get('SESSION_ID');

  if (!prolificPid) {
    return NextResponse.json({ error: "no external call" }, { status: 400 });
  }

  const participant = await prisma.participant.upsert({
    where: { prolificPid },
    update: {
      prolificPid,
      studyId: studyId ?? null,
      sessionId: sessionId ?? null,
    },
    create: { 
      prolificPid,
      studyId: studyId ?? null,
      sessionId: sessionId ?? null,
    },
  });
  const redirectUrl = new URL(`/${participant.id}/consent`, new URL(request.url).origin).toString();
  return NextResponse.redirect(redirectUrl);
}

