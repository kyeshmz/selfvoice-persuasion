import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';


export async function PATCH( request: NextRequest,  { params }: {params: Promise<{ id: string }>}) {
    const formData = await request.formData();
    const file = formData.get("audio") as File;
    if (!file) {
        return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }
    const { id } = await params;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(process.cwd(), "audio_uploads", `${id}.webm`);
    await writeFile(filePath, buffer);
    
    const updated = await prisma.participant.update({
        where: { id },
        data: { audioUrl: `${id}.webm` },
    });
    return NextResponse.json(updated);
}