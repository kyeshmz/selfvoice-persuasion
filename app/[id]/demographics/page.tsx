"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const QUESTIONS = [
  "How old are you?",
  "What is your first language?",
]

export default function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`/api/${id}`)
            .then(res => res.json())
            .then(data => { setAnswers(data.participant.demographics || {});} );
    }, [id]);

    const saveAnswers = async () => {
        await fetch(`/api/${id}/demographics`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
        });
    };
    const handleChange = (q: string, val: string) => {
        setAnswers(prev => ({ ...prev, [q]: val }));
    };


    const handleNext = async () => {
        await saveAnswers();
        router.push(`/${id}/audio`);
    };

    const handleBack = async () => {
        await saveAnswers();
        router.push(`/${id}/consent`);
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Survey Questions</h1>
            <form className="space-y-4">
                {QUESTIONS.map(q => (
                    <div key={q}>
                        <label className="block font-medium">{q}</label>
                        <input
                            type="text"
                            value={answers[q] || ""}
                            onChange={e => handleChange(q, e.target.value)}
                            className="border p-2 w-full"
                        />
                    </div>
                ))}
            </form>
            <div className="mt-6 flex justify-between">
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleBack}>
                    Back
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleNext}>
                    Next
                </button>
            </div>
        </div>
    );
}
