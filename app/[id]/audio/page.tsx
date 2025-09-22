"use client"

import { use, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function AudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const chunks = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            setMediaStream(stream);
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (e) => chunks.current.push(e.data);
            recorder.onstop = uploadRecording;
            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Failed to start recording. Please check your microphone permissions and try again.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        
        // Clean up media stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
        
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
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Record Your Audio</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-3">Recording Instructions</h2>
                <div className="text-blue-700 text-sm space-y-2">
                    <p>Please record a short audio sample of yourself speaking. </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
                <div className="text-center">
                    {!recording ? (
                        <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                            </div>
                            <p className="text-gray-600">Ready to record</p>
                            <button
                                className="bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-3 mx-auto"
                                onClick={startRecording}
                            >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                                Start Recording
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                            </div>
                            <p className="text-red-600 font-medium">Recording in progress...</p>
                            <button
                                className="bg-red-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-3 mx-auto"
                                onClick={stopRecording}
                            >
                                <div className="w-4 h-4 bg-white rounded"></div>
                                Stop Recording
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    onClick={() => router.push(`/${id}/demographics`)}
                >
                    Back
                </button>
                <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => router.push(`/${id}/done`)}
                >
                    Finish Study
                </button>
            </div>
        </div>
    );
}
