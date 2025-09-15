import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { externalId } = await request.json();

  if (!externalId) {
    return NextResponse.json({ error: "no external call" }, { status: 400 });
  }

  const participant = await prisma.participant.upsert({
    where: { externalId },
    update: {},
    create: { externalId },
  });

  return NextResponse.json({ participant });
}