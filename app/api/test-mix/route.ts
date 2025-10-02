import { NextRequest, NextResponse } from "next/server";
import { mixVoice, getOrCreateExperiment } from "@/lib/server-actions";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const participantId = url.searchParams.get("participantId");
  const alphaParam = url.searchParams.get("alpha");
  const alpha = alphaParam ? Number(alphaParam) : undefined;

  if (!participantId) {
    return NextResponse.json({ error: "participantId is required" }, { status: 400 });
  }

  try {
    await mixVoice(participantId, alpha ?? 1);
    const experiment = await getOrCreateExperiment(participantId);
    return NextResponse.json({
      ok: true,
      experimentId: experiment.id,
      hasEmbedding: Boolean(experiment.voiceEmbeddings),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 500 });
  }
}


