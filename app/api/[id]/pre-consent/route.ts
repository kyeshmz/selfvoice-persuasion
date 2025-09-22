import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { audioCheckPassed } = await request.json();

    
    const updated = await prisma.participant.update({
        where: { id },
            data: { audioCheckPassed: audioCheckPassed },
    });
        
    return NextResponse.json({ updated });
    
}

