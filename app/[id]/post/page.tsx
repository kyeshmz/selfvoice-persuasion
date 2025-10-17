"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DataUtils } from "@/lib/data-utils"

const QUESTIONS = [

  {
    question: "How did you hear about this study?",
    type: "select" as const,
    options: ["Social Media", "Email", "Friend", "Other"]
  },
  {
    question: "How interesting did you find the study?",
    type: "select" as const,
    options: ["Very interesting", "Somewhat interesting", "Not very interesting", "Not at all interesting"]
  },
  {
    question: "Any other comments?",
    type: "text" as const,
    placeholder: "Enter your comments here"
  }
]

export default function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});


    const handleChange = (q: string, val: string) => {
        setAnswers(prev => ({ ...prev, [q]: val }));
    };

    const isFormValid = () => {
        return QUESTIONS.every(q => answers[q.question] && answers[q.question].trim() !== "");
    };


    const handleNext = async () => {
        await DataUtils.savePostStudyQuestions(id, answers);
        router.push(`/thanks`);
    };


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Post-Study Questions</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-3">Questions</h2>
                <p className="text-blue-700 text-sm">
                    Please answer the following questions.
                </p>
            </div>

            <form className="space-y-6">
                {QUESTIONS.map((q, index) => (
                    <div key={q.question} className="bg-white border border-gray-200 rounded-lg p-6">
                        <label className="block font-medium text-gray-900 mb-3">
                            {q.question}
                        </label>
                        {q.type === "select" ? (
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
                        ) : (
                            <input
                                type="text"
                                value={answers[q.question] || ""}
                                onChange={e => handleChange(q.question, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder={q.placeholder || ""}
                            />
                        )}
                    </div>
                ))}
            </form>

            <div className="mt-8 flex justify-between items-center">
                <button 
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isFormValid() 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={handleNext}
                    disabled={!isFormValid()}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
