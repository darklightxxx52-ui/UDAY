
import React from 'react';
import { Question } from '../types';

interface QuizCardProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  currentIndex: number;
  totalQuestions: number;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  currentIndex, 
  totalQuestions 
}) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{question.category}</span>
          <span className="text-sm font-medium text-gray-400">પ્રશ્ન {currentIndex + 1} / {totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed text-gray-800">
        {question.question}
      </h2>

      <div className="grid gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group ${
              selectedAnswer === index
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${
              selectedAnswer === index ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
            }`}>
              {String.fromCharCode(65 + index)}
            </div>
            <span className="text-lg">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizCard;
