"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataUtils } from "@/lib/data-utils"

const QUESTIONS = [
  "How old are you?",
  "What is your first language?",
]

export default function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        DataUtils.getParticipant(id)
            .then(participant => setAnswers(participant?.demographics as Record<string, string> || {}))
            .catch(error => console.error('Failed to load participant data:', error));
    }, [id]);

    const handleChange = (q: string, val: string) => {
        setAnswers(prev => ({ ...prev, [q]: val }));
    };

    const isFormValid = () => {
        return QUESTIONS.every(q => answers[q] && answers[q].trim() !== "");
    };


    const handleNext = async () => {
        await DataUtils.updateDemographics(id, answers);
        router.push(`/${id}/audio`);
    };

    const handleBack = async () => {
        await DataUtils.updateDemographics(id, answers);
        router.push(`/${id}/gateway`);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Demographic Information</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-3">About You</h2>
                <p className="text-blue-700 text-sm">
                    Please provide some basic information about yourself.
                </p>
            </div>

            <form className="space-y-6">
                {QUESTIONS.map((q, index) => (
                    <div key={q} className="bg-white border border-gray-200 rounded-lg p-6">
                        <label className="block font-medium text-gray-900 mb-3">
                            {q}
                        </label>
                        <input
                            type="text"
                            value={answers[q] || ""}
                            onChange={e => handleChange(q, e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={`Please enter your ${q.toLowerCase().replace('?', '')}...`}
                        />
                    </div>
                ))}
            </form>

            <div className="mt-8 flex justify-between items-center">
                <button 
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    onClick={handleBack}
                >
                    Back
                </button>
                <button 
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isFormValid() 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={handleNext}
                    disabled={!isFormValid()}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
