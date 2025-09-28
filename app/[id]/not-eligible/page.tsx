"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getParticipant } from "@/lib/server-actions"

export default function NotEligiblePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [reason, setReason] = useState<string>("");

    useEffect(() => {
        const fetchReason = async () => {
            try {
                const participant = await getParticipant(id);
                if (participant?.ineligibilityReason) {
                    const rawReason = participant.ineligibilityReason;
                    if (rawReason == "Age") {
                        setReason("You are not eligible to participate in this study because you must be at least 18 years old.");
                    } else if (rawReason == "Human") {
                        setReason("You are not eligible to participate in this study because you did not pass the human check.");
                    } else if (rawReason == "Audio") {
                        setReason("You are not eligible to participate in this study because you did not pass the audio check.");
                    } else {
                        setReason(rawReason);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch participant data:", error);
            }
        };
        
        fetchReason();
    }, [id]);

    const handleReturn = () => {
        router.push('/');
    };
    
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-red-600">Not Eligible</h1>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                    <div className="text-red-500 mt-0.5 text-xl">⚠️</div>
                    <div>
                        <h2 className="font-medium text-red-800 mb-2">Study Eligibility</h2>
                        <p className="text-red-700 mb-4">
                            Thank you for your interest in participating in this study. 
                            Unfortunately, you are not eligible to participate at this time.
                        </p>
                        {reason && (
                            <div className="bg-white border border-red-300 rounded-lg p-4">
                                <h3 className="font-medium text-red-800 mb-2">Reason:</h3>
                                <p className="text-red-700">{reason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                    We appreciate your time and interest in our research. 
                    If you have any questions about this decision, please contact the study team.
                </p>
            </div>

            <div className="text-center">
                <button
                    onClick={handleReturn}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
}
