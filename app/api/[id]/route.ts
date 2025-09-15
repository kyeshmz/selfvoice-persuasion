import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string }>}) {
    const { id } = await params;
    const participant = await prisma.participant.findUnique({
        where: { id },
    });

    if (!participant) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ participant });
}
