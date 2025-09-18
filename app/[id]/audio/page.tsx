"use client"

import { use, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function AudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const chunks = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunks.current.push(e.data);
        recorder.onstop = uploadRecording;
        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setRecording(false);
    };

    const uploadRecording = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        chunks.current = [];

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        await fetch(`/api/${id}/audio`, {
            method: "PATCH",
            body: formData,
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Record Your Audio</h1>
            <div className="flex gap-4">
                {!recording ? (
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        onClick={startRecording}
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={stopRecording}
                    >
                        Stop Recording
                    </button>
                )}
            </div>
            <div className="mt-6 flex justify-between">
                <button
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => router.push(`/${id}/demographics`)}
                >
                    Back
                </button>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => router.push(`/${id}/done`)}
                >
                    Finish
                </button>
            </div>
        </div>
    );
}
