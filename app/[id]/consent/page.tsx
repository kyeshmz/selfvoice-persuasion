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
    return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Consent Form</h1>
      <p className="mb-4">Lorem Ipsum</p>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
        />
        I consent
      </label>
      <div className="mt-6 flex justify-end">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!consent}
          onClick={handleConsent}
        >
          Next
        </button>
      </div>
    </div>
  )
}