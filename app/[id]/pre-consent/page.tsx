"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AudioCheckResult {
    hasPermission: boolean
    hasMicrophone: boolean
    canRecord: boolean
    error?: string
}

export default function PreConsentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [audioCheck, setAudioCheck] = useState<AudioCheckResult | null>(null);

    const checkAudio = async (): Promise<AudioCheckResult> => {
        try {

            if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
                return {
                    hasPermission: false,
                    hasMicrophone: false,
                    canRecord: false,
                    error: "Your browser doesn't support audio recording."
                };
            }
    
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const hasAudioTracks = stream.getAudioTracks().length > 0;
            
            let canRecord = false;
            try {
                new MediaRecorder(stream);
                canRecord = true;
            } catch {
                canRecord = false;
            }
    
            stream.getTracks().forEach(track => track.stop());
    
            return {
                hasPermission: true,
                hasMicrophone: hasAudioTracks,
                canRecord: canRecord && hasAudioTracks,
                error: canRecord && hasAudioTracks ? undefined : "Unable to initialize audio recording."
            };
    
        } catch (error) {
    
            return {
                hasPermission: false,
                hasMicrophone: false,
                canRecord: false,
                error: error instanceof Error ? error.name : "Unknown error"
            };
        }
    };
    
    const handleCheckAudio = async () => {
        try {
            const result = await checkAudio();
            setAudioCheck(result);
            
            if (result.canRecord) {
                await fetch(`/api/${id}/pre-consent`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ audioCheckPassed: true }),
                });
            }
        } catch (error) {
            setAudioCheck({
                hasPermission: false,
                hasMicrophone: false,
                canRecord: false,
                error: "Failed to check audio capabilities."
            });
        }
    };

    const handleContinue = () => {
        router.push(`/${id}/consent`);
    };

    const handleRetry = () => {
        setAudioCheck(null);
    };

    const isAudioReady = audioCheck?.hasPermission && audioCheck?.hasMicrophone && audioCheck?.canRecord;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Audio Setup Check</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                    Before we begin, we need to check that your microphone is working properly. 
                    This will help ensure a smooth recording experience.
                </p>
            </div>

            {!audioCheck && (
                <div className="text-center">
                    <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                        onClick={handleCheckAudio}
                    >
                        Check Audio Setup
                    </button>
                </div>
            )}



            {audioCheck && (
                <div className="space-y-4">
                    {/* Status indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg border-2 ${audioCheck.hasPermission ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${audioCheck.hasPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium">Permission</span>
                            </div>
                            <p className="text-sm mt-1 text-gray-600">
                                {audioCheck.hasPermission ? 'Granted' : 'Denied'}
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg border-2 ${audioCheck.hasMicrophone ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${audioCheck.hasMicrophone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium">Microphone</span>
                            </div>
                            <p className="text-sm mt-1 text-gray-600">
                                {audioCheck.hasMicrophone ? 'Detected' : 'Not found'}
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg border-2 ${audioCheck.canRecord ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${audioCheck.canRecord ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium">Recording</span>
                            </div>
                            <p className="text-sm mt-1 text-gray-600">
                                {audioCheck.canRecord ? 'Ready' : 'Not ready'}
                            </p>
                        </div>
                    </div>

                    {/* Error message */}
                    {audioCheck.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-red-500 mt-0.5">⚠️</div>
                                <div>
                                    <h3 className="font-medium text-red-800 mb-1">Audio Setup Issue</h3>
                                    <p className="text-red-700">{audioCheck.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {isAudioReady && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-green-500 mt-0.5">✅</div>
                                <div>
                                    <h3 className="font-medium text-green-800 mb-1">Audio Setup Complete</h3>
                                    <p className="text-green-700">
                                        Your microphone is ready for recording. You can now proceed to the consent form.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            onClick={() => router.push(`/${id}`)}
                        >
                            Back
                        </button>

                        <div className="flex gap-3">
                            {!isAudioReady && (
                                <button
                                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                                    onClick={handleRetry}
                                >
                                    Try Again
                                </button>
                            )}
                            
                            {isAudioReady && (
                                <button
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                                    onClick={handleContinue}
                                >
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
