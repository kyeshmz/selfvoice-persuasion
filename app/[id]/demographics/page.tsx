"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataUtils } from "@/lib/data-utils"

const QUESTIONS = [
  {
    question: "What is your age?",
    type: "number" as const,
    min: 18,
    max: 100
  },
  {
    question: "What is your first language?",
    type: "select" as const,
    options: ["English", "Spanish", "Mandarin", "Hindi", "Arabic", "Portuguese", "Bengali", "Russian", "Japanese", "Other"]
  },
  {
    question: "What is your gender?",
    type: "select" as const,
    options: ["Male", "Female", "Non-binary", "Prefer not to say", "Other"]
  },
  {
    question: "How often do you use AI tools?",
    type: "select" as const,
    options: ["Daily", "Several times a week", "Once a week", "A few times a month", "Rarely", "Never"]
  },
  {
    question: "What country do you currently live in?",
    type: "select" as const,
    options: ["United States", "United Kingdom", "Canada", "Australia", "India", "Germany", "France", "China", "Japan", "Brazil", "Other"]
  }
]

export default function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        DataUtils.getParticipant(id)
            .then(participant => {
                if (participant?.demographicsData) {
                    const { age, firstLanguage, gender, aiUse, country } = participant.demographicsData;
                    setAnswers({
                        "What is your age?": age || "",
                        "What is your first language?": firstLanguage || "",
                        "What is your gender?": gender || "",
                        "How often do you use AI tools?": aiUse || "",
                        "What country do you currently live in?": country || "",
                    });
                }
            })
            .catch(error => console.error('Failed to load participant data:', error));
    }, [id]);

    const handleChange = (q: string, val: string) => {
        setAnswers(prev => ({ ...prev, [q]: val }));
    };

    const isFormValid = () => {
        return QUESTIONS.every(q => answers[q.question] && answers[q.question].trim() !== "");
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
                    <div key={q.question} className="bg-white border border-gray-200 rounded-lg p-6">
                        <label className="block font-medium text-gray-900 mb-3">
                            {q.question}
                        </label>
                        {q.type === "number" ? (
                            <input
                                type="number"
                                min={q.min}
                                max={q.max}
                                value={answers[q.question] || ""}
                                onChange={e => handleChange(q.question, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder={`Enter a number between ${q.min} and ${q.max}`}
                            />
                        ) : (
                            <select
                                value={answers[q.question] || ""}
                                onChange={e => handleChange(q.question, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            >
                                <option value="" disabled>Select an option...</option>
                                {q.options?.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        )}
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
