"use server"

import prisma from './prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function updateAudioFile(id: string, audioBlob: Blob) {
  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  const filePath = path.join(process.cwd(), "audio_uploads", `${id}.webm`);
  await writeFile(filePath, buffer);
  
  const updated = await prisma.participant.update({
    where: { id },
    data: { audioFile: `${id}.webm` },
  });
  return updated;
}

export async function updateConsent(id: string, consent: boolean) {
  const updated = await prisma.participant.update({
    where: { id },
    data: { consentGiven: consent },
  });
  return updated;
}

export async function updateDemographics(id: string, answers: Record<string, string>) {
  const updated = await prisma.participant.update({
    where: { id },
    data: { demographics: answers },
  });
  return updated;
}

export async function getParticipant(id: string) {
  const participant = await prisma.participant.findUnique({
    where: { id },
  });
  return participant;
}

export async function updateEligibility(id: string, eligible: boolean, reason?: string) {
  const updated = await prisma.participant.upsert({
    where: { id },
    update: { 
      eligible: eligible,
      ineligibilityReason: reason || null
    },
    create: { 
      id,
      externalId: `unknown-${id}`, // fallback externalId
      eligible: eligible,
      ineligibilityReason: reason || null
    },
  });
  return updated;
}