"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataUtils } from "@/lib/data-utils"

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
    const [audioTries, setAudioTries] = useState<number>(0);
    //const [birthday, setBirthday] = useState<string>("");
    const [age, setAge] = useState<number>(0);
    const [showQuestions, setShowQuestions] = useState(false);
    const [audioAnswer, setAudioAnswer] = useState<string>("");

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
                setShowQuestions(true);
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


    const handleContinue = async () => {
        console.log(age);
        if (age < 18) {
            await DataUtils.updateEligibility(id, false, "Age");
            router.push(`/${id}/not-eligible`);
            return;
        }
        if (audioAnswer !== "seven") {
            await DataUtils.updateEligibility(id, false, "Human");
            router.push(`/${id}/not-eligible`);
            return;
        }
        await DataUtils.updateEligibility(id, true);
        router.push(`/${id}/demographics`);
    };

    const handleRetry = async () => {
        setAudioTries(audioTries + 1);
        if (audioTries >= 5) {
            try {
                await DataUtils.updateEligibility(id, false, "Audio");
                router.push(`/${id}/not-eligible`);
            } catch (error) {
                console.error('Failed to update eligibility:', error);
                // Still redirect even if database update fails
                router.push(`/${id}/not-eligible`);
            }
            return;
        }
        setAudioCheck(null);
        await handleCheckAudio();
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
                                <div className="flex-1">
                                    <h3 className="font-medium text-red-800 mb-1">Audio Setup Issue</h3>
                                    <p className="text-red-700 mb-3">{audioCheck.error}</p>
                                    <button
                                        onClick={handleRetry}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Retry Audio Check
                                    </button>
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
                                        Your microphone is ready for recording.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Birthday and Age Questions */}
            {showQuestions && (
                <div className="mt-8 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-blue-800 mb-4">Additional Information</h2>
                        
                        <div className="space-y-4">
                            {/* Birthday Question 
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <label className="block font-medium text-gray-900 mb-2">
                                    What is your birthday?
                                </label>
                                <input
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>*/}


                            {/* Age Question */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <label className="block font-medium text-gray-900 mb-2">
                                    What is your age?
                                </label>
                                <select
                                    value={age}
                                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : 0)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select your age</option>
                                    {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Audio Question */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <label className="block font-medium text-gray-900 mb-2">
                                    What is the second word in the audio?
                                </label>
                                <div className="space-y-4">
                                    <audio 
                                        controls 
                                        className="w-full"
                                        preload="metadata"
                                    >
                                        <source src="/synthesize.mp3" type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    
                                    <select
                                        value={audioAnswer}
                                        onChange={(e) => setAudioAnswer(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select the second word</option>
                                        {["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"].map((word) => (
                                            <option key={word} value={word}>{word}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <button
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                disabled={!age || !audioAnswer}
                                onClick={handleContinue}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
