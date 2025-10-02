'use client';

import { use, useState } from 'react';
import { DataUtils } from '@/lib/data-utils';
import { useRouter } from 'next/navigation';


interface AudioPlayerProps {
  src: string;
  label: string;
  color: 'blue' | 'green';
}

function AudioPlayer({ src, label, color }: AudioPlayerProps) {
  const colorClasses = {
    blue: {
      dot: 'bg-blue-500',
      border: 'border-blue-200'
    },
    green: {
      dot: 'bg-green-500',
      border: 'border-green-200'
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${colorClasses[color].border}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color].dot}`}></div>
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>
      
      <audio 
        controls 
        className="w-full"
        preload="metadata"
      >
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default function ExperimentPage({ params }: { params: Promise<{ id: string, experimentId: string }> }) {
  const { id, experimentId } = use(params);
  const [ratings, setRatings] = useState<Record<string, { left: number; right: number }>>({});
  const router = useRouter();

  const questions = [

    {
      id: 'naturalness',
      question: 'How likely would you be to purchase the pen?'
    },
    {
      id: 'persuasiveness',
      question: 'How persuasive is this voice?'
    },
    {
      id: 'trustworthiness',
      question: 'How trustworthy does this voice sound?'
    },
    {
      id: 'preference',
      question: 'How likeable is this voice?'
    }
  ];

  const handleRatingChange = (questionId: string, side: 'left' | 'right', rating: number) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [side]: rating
      }
    }));
  };

  const isComplete = questions.every(q => {
    const questionRatings = ratings[q.id];
    return questionRatings?.left > 0 && questionRatings?.right > 0;
  });

  const handleSubmit = async() => {
    await DataUtils.saveRatings(experimentId, ratings);
    router.push(`/${id}/${experimentId}/done`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Comparison Study</h1>
          <p className="text-gray-600">Please listen to both audio samples and rate them on the following criteria</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Audio A with Questions */}
          <div className="space-y-6">
            <AudioPlayer 
              src="/base_script.mp3" 
              label="Audio A" 
              color="blue" 
            />
            
            {/* Left Side Questions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Rate Audio A
              </h2>
              {questions.map((question) => (
                <div key={`left-${question.id}`} className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">{question.question}</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingChange(question.id, 'left', value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          ratings[question.id]?.left === value
                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <span className="text-xs font-medium">{value}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Bad</span>
                    <span>Amazing</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Side - Audio B with Questions */}
          <div className="space-y-6">
            <AudioPlayer 
              src={`/experiments/${experimentId}.mp3`} 
              label="Audio B" 
              color="blue" 
            />
            
            {/* Right Side Questions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Rate Audio B
              </h2>
              {questions.map((question) => (
                <div key={`right-${question.id}`} className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">{question.question}</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingChange(question.id, 'right', value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          ratings[question.id]?.right === value
                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <span className="text-xs font-medium">{value}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Bad</span>
                    <span>Amazing</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              isComplete
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isComplete ? 'Submit Ratings' : 'Complete all ratings to submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
