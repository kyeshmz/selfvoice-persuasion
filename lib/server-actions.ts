"use server"

import prisma from './prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { CartesiaClient } from '@cartesia/cartesia-js';
import { createReadStream } from "fs";
import fs from 'fs';

export async function updateAudioFile(id: string, audioBlob: Blob) {
  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  const filePath = path.join(process.cwd(), "audio_uploads", `${id}.mp3`);
  await writeFile(filePath, buffer);
  
  const updated = await prisma.participant.update({
    where: { id },
    data: { audioFile: `${id}.mp3` },
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
  const updated = await prisma.participant.update({
    where: { id },
    data: { 
      eligible: eligible,
      ineligibilityReason: reason || null
    },
  });
  return updated;
}

export async function uploadVoice(id: string) {
  const participant = await prisma.participant.findUnique({
    where: { id },
  });
  if (!participant) {
    throw new Error("Participant not found");
  }
  const voiceFile = participant.audioFile;
  if (!voiceFile) {
    throw new Error("No audio file found for participant");
  }
  const voiceId = participant.voiceId;
  if (voiceId) {
    return voiceId;
  }
  const client = new CartesiaClient({ apiKey: process.env.CARTESIA_API_KEY });
  
  const output = await client.voices.clone(fs.createReadStream(path.join(process.cwd(), "audio_uploads", voiceFile)), {
    name: "A high-similarity cloned voice",
    description: "Copied from Cartesia docs",
    mode: "similarity",
    language: "en"
  });
  
  await prisma.participant.update({
    where: { id },
    data: { voiceId: output.id },
  });
  return output;
}

export async function getOrCreateExperiment(participantId: string) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });
  if (!participant) {
    throw new Error("Participant not found");
  }

  // Find the most recent experiment for this participant
  const mostRecentExperiment = await prisma.experiment.findFirst({
    where: { participantId },
    orderBy: { createdAt: 'desc' },
  });

  if (!mostRecentExperiment || mostRecentExperiment.completedAt) {
    const newExperiment = await prisma.experiment.create({
      data: {
        participantId,
      },
    });
    return newExperiment;
  }

  // Return the most recent incomplete experiment
  return mostRecentExperiment;
}


export async function mixVoice(id: string, alpha: number = 1) {
  const participant = await prisma.participant.findUnique({
    where: { id },
  });
  if (!participant) {
    throw new Error("Participant not found");
  }
  const voiceId = participant.voiceId;
  if (!voiceId) {
    throw new Error("No voice id found for participant");
  }
  const url = 'https://api.cartesia.ai/voices/mix';
  const apiKey = process.env.CARTESIA_API_KEY;
  const baseVoiceId = process.env.BASE_VOICE_ID;
  const options = {
    method: 'POST',
    headers: {
      'Cartesia-Version': '2024-11-13',
      'X-API-Key': apiKey!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      voices: [
        { id: voiceId, weight: alpha },
        { id: baseVoiceId, weight: 1 }
      ]
    })
  } satisfies RequestInit;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    // Update the most recent experiment for this participant
    const mostRecentExperiment = await prisma.experiment.findFirst({
      where: { participantId: id },
      orderBy: { createdAt: 'desc' },
    });
    
    if (mostRecentExperiment) {
      await prisma.experiment.update({
        where: { id: mostRecentExperiment.id },
        data: { voiceEmbeddings: data.embedding },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getRecording(experimentId: string, input: string) {
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
  });
  if (!experiment) {
    throw new Error("Experiment not found");
  }
  if (experiment.experimentFile) {
    return experiment.experimentFile;
  }
  const embedding = experiment.voiceEmbeddings;
  if (!embedding) {
    throw new Error("No embedding found for experiment");
  }
  const client = new CartesiaClient({ apiKey: process.env.CARTESIA_API_KEY });
  const fs = require('fs');
  const path = require('path');

  const audioBuffer = await client.tts.bytes({
    modelId: "sonic-2",
    transcript: input,
    voice: {
        mode: "embedding",
        embedding: embedding
    },
    language: "en",
    outputFormat: {
        container: "mp3",
        sampleRate: 44100,
        bitRate: 128000
    }
  });

  // Ensure the directory exists
  const dir = path.join(process.cwd(), 'public', 'experiments');
  const filePath = path.join(dir, `${experimentId}.mp3`);
  
  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(audioBuffer);
  fs.writeFileSync(filePath, buffer);

  const updated = await prisma.experiment.update({
    where: { id: experimentId },
    data: { experimentFile: `${experimentId}.mp3` },
  });
  return updated;
}

export async function getAudioFile(experimentId: string) {
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
  });
  
  if (!experiment) {
    throw new Error("Experiment not found");
  }
  
  if (!experiment.experimentFile) {
    throw new Error("No audio file found for experiment");
  }
  
  const filePath = path.join('experiments', experiment.experimentFile);
  
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file not found on disk");
  }
  
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer;
}

