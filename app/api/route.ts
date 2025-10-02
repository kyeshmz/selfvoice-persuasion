import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const externalId = url.searchParams.get('PROLIFIC_PID');

  if (!externalId) {
    return NextResponse.json({ error: "no external call" }, { status: 400 });
  }

  const participant = await prisma.participant.upsert({
    where: { externalId },
    update: {},
    create: { externalId },
  });
  const redirectUrl = new URL(`/${participant.id}/consent`, new URL(request.url).origin).toString();
  return NextResponse.redirect(redirectUrl);
}