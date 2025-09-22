'use client';
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConsentPage({ params }: { params: Promise<{ id: string }>}) {
    const router = useRouter();
    const { id } = use(params);
    const [consent, setConsent] = useState(false);
    useEffect(() => {
        fetch(`/api/${id}`)
            .then(res => res.json())
            .then(data => setConsent(data.participant.consentGiven))
        }, [id]);
    const handleConsent = async () => {
        await fetch(`/api/${id}/consent`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consent: true }),
        });
        router.push(`/${id}/demographics`);
    }

    const handleBack = () => {
        router.push(`/${id}/pre-consent`);
    }
    return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Consent Form</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">Study Information</h2>
        <div className="text-blue-700 text-sm space-y-2">
          <p>This study involves recording your voice for research purposes. </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <div>
            <span className="font-medium text-gray-900">I consent to participate in this study</span>
            <p className="text-sm text-gray-600 mt-1">
              By checking this box, I confirm that I have read and understood the information above, 
              and I voluntarily agree to participate in this research study.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          onClick={handleBack}
        >
          Back
        </button>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={!consent}
          onClick={handleConsent}
        >
          Continue
        </button>
      </div>
    </div>
  )
}