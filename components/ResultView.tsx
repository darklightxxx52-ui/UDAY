
import React, { useState } from 'react';
import { Question } from '../types';
import { getExplanationFromAI } from '../services/geminiService';

interface ResultViewProps {
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: number[];
  onReset: () => void;
  userName?: string | null;
}

const ResultView: React.FC<ResultViewProps> = ({ 
  score, 
  totalQuestions, 
  questions, 
  userAnswers, 
  onReset,
  userName
}) => {
  const [selectedExplainingIndex, setSelectedExplainingIndex] = useState<number | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const percentage = Math.round((score / totalQuestions) * 100);
  
  const handleShare = async () => {
    const shareTitle = 'LRD ક્વિઝ માસ્ટર';
    const shareText = `LRD ક્વિઝ માસ્ટર: ${userName} એ ${score}/${totalQuestions} સ્કોર મેળવ્યો છે! તમે પણ તમારી ગુજરાત પોલીસની તૈયારી તપાસો:`;
    const shareUrl = window.location.href;
    const fullMessage = `${shareText} ${shareUrl}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(fullMessage);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
      } catch (err) {
        console.error('Could not copy text: ', err);
      }
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.warn('Share with URL failed, trying text-only share...', err);
        try {
          await navigator.share({
            title: shareTitle,
            text: fullMessage,
          });
        } catch (innerErr) {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const handleExplain = async (index: number) => {
    if (selectedExplainingIndex === index) {
      setSelectedExplainingIndex(null);
      return;
    }
    
    setSelectedExplainingIndex(index);
    setIsLoadingAi(true);
    setAiExplanation('');
    const question = questions[index];
    const explanation = await getExplanationFromAI(question.question, question.options[question.correctAnswer]);
    setAiExplanation(explanation);
    setIsLoadingAi(false);
  };

  const getResultIcon = () => {
    if (percentage >= 80) return "🦁";
    if (percentage >= 50) return "💪";
    return "📚";
  };

  return (
    <div className="space-y-8 pb-20 animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border-t-8 border-blue-600">
        <div className="text-7xl mb-6">{getResultIcon()}</div>
        <h2 className="text-3xl font-black mb-2 text-gray-800">સ્કોર કાર્ડ</h2>
        <p className="text-gray-500 mb-8 font-medium">શાબાશ {userName}! તમારી તૈયારીનું પરિણામ નીચે મુજબ છે</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="text-3xl font-black text-green-600">{score}</div>
            <div className="text-[10px] font-black text-green-700 uppercase tracking-widest">સાચા</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="text-3xl font-black text-red-600">{totalQuestions - score}</div>
            <div className="text-[10px] font-black text-red-700 uppercase tracking-widest">ખોટા</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="text-3xl font-black text-blue-600">{percentage}%</div>
            <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest">ટકા</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onReset}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            બીજો ભાગ શરૂ કરો
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>{showCopyFeedback ? "લીંક કોપી થઈ!" : "પરિણામ મોકલો 📤"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-100 p-1 rounded-2xl sticky top-20 z-10">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${filter === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            બધા પ્રશ્નો ({totalQuestions})
          </button>
          <button 
            onClick={() => setFilter('wrong')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${filter === 'wrong' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            માત્ર ખોટા ({totalQuestions - score})
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.correctAnswer;
            if (filter === 'wrong' && isCorrect) return null;
            
            return (
              <div key={idx} className={`bg-white rounded-2xl p-6 border-l-8 shadow-sm transition-all ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    પ્રશ્ન {idx + 1} - {isCorrect ? 'સાચું' : 'ખોટું'}
                  </span>
                  <button 
                    onClick={() => handleExplain(idx)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center transition-colors"
                  >
                    ✨ AI સમજૂતી
                  </button>
                </div>
                
                <p className="font-bold text-gray-800 text-lg mb-4 leading-relaxed">{q.question}</p>
                
                <div className="grid gap-2 mb-4">
                   <div className={`p-3 rounded-xl text-sm font-medium ${isCorrect ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                      તમારો જવાબ: {q.options[userAnswers[idx]]}
                   </div>
                   {!isCorrect && (
                     <div className="p-3 rounded-xl text-sm font-medium bg-green-50 border border-green-200 text-green-800">
                        સાચો જવાબ: {q.options[q.correctAnswer]}
                     </div>
                   )}
                </div>

                {selectedExplainingIndex === idx && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl text-blue-900 shadow-inner animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center font-black mb-3 text-xs uppercase tracking-widest text-blue-700">
                      <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2">i</span>
                      AI વિશ્લેષણ
                    </div>
                    {isLoadingAi ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                        <span className="font-medium">વિચારાઈ રહ્યું છે...</span>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {aiExplanation || q.explanation || "સમજૂતી ઉપલબ્ધ નથી."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultView;
