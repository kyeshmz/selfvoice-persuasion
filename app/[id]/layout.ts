import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function Layout({children, params}: { children: React.ReactNode; params: Promise<{ id: string }>}) {
    const { id } = await params;
    const participant = await prisma.participant.findUnique({
        where: { id },
    });

    if (!participant) {
        notFound(); 
    }

    return children;
}
