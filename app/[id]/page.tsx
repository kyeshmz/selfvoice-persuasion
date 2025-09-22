"use client"

import { use} from "react"
import { useRouter } from "next/navigation"

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const {id} = use(params);
  const startStudy = async () => {
    router.push(`/${id}/pre-consent`)
  }

  return (
    <div className="font-sans min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Self-Voice Persuasion Study</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Welcome!</h2>
          <p className="text-blue-700 text-sm leading-relaxed">
            Thank you for participating in our study.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={startStudy}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            
              Start Study
          </button>

          
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>This study typically takes TIME to complete.</p>
        </div>
      </div>
    </div>
  )
}
