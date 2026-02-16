
import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import QuizCard from './components/QuizCard';
import ResultView from './components/ResultView';
import LoginView from './components/LoginView';
import SettingsView from './components/SettingsView';
import { QUESTIONS, CATEGORIES } from './constants';
import { QuizState, Category, Question, DifficultyLevel } from './types';
import { generateDynamicQuestions } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'settings'>('home');
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    userAnswers: [],
    isFinished: false,
    selectedCategory: null,
    selectedLevel: null,
    selectedPart: null,
    isLoading: false,
    dynamicQuestions: [],
    userName: localStorage.getItem('lrd_user_name')
  });

  const [completedParts, setCompletedParts] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('lrd_completed_parts');
    if (saved) setCompletedParts(JSON.parse(saved));
  }, []);

  const handleLogin = (name: string) => {
    localStorage.setItem('lrd_user_name', name);
    setState(prev => ({ ...prev, userName: name }));
  };

  const handleLogout = () => {
    localStorage.removeItem('lrd_user_name');
    setState(prev => ({ ...prev, userName: null }));
    setActiveTab('home');
  };

  const handleAppShare = async () => {
    const shareData = {
      title: 'LRD ક્વિઝ માસ્ટર',
      text: `પોલીસ ભરતી (LRD/PSI) ની તૈયારી માટેની સૌથી બેસ્ટ ગુજરાતી એપ! ૪૭૦૦+ MCQ અને ૧૦૦ ફ્રી ભાગ. તમે પણ અત્યારે જ તૈયારી શરૂ કરો:`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('લિંક કોપી થઈ ગઈ છે! હવે તમે WhatsApp પર પેસ્ટ કરી શકો છો.');
      }
    } catch (err) { console.error(err); }
  };

  const handleStartFinalQuiz = async (category: string, level: DifficultyLevel, part: number) => {
    setState(prev => ({ ...prev, isLoading: true, selectedPart: part }));
    try {
      const dynamic = await generateDynamicQuestions(category, level, part);
      setState(prev => ({
        ...prev,
        isLoading: false,
        dynamicQuestions: dynamic,
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: [],
        isFinished: false
      }));
    } catch (error) {
      alert("સર્વર કનેક્શનમાં સમસ્યા છે. ફરી પ્રયાસ કરો.");
      setState(prev => ({ ...prev, isLoading: false, selectedCategory: null, selectedLevel: null, selectedPart: null }));
    }
  };

  const handleFinishQuiz = () => {
    if (state.selectedCategory && state.selectedLevel && state.selectedPart) {
      const partId = `${state.selectedCategory}-${state.selectedLevel}-${state.selectedPart}`;
      if (!completedParts.includes(partId)) {
        const newCompleted = [...completedParts, partId];
        setCompletedParts(newCompleted);
        localStorage.setItem('lrd_completed_parts', JSON.stringify(newCompleted));
      }
    }
    setState(prev => ({ ...prev, isFinished: true }));
  };

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    const questions = state.dynamicQuestions.length > 0 ? state.dynamicQuestions : QUESTIONS;
    const isCorrect = answerIndex === questions[state.currentQuestionIndex].correctAnswer;
    const newUserAnswers = [...state.userAnswers, answerIndex];
    const newScore = isCorrect ? state.score + 1 : state.score;

    if (state.currentQuestionIndex === questions.length - 1) {
      handleFinishQuiz();
      setState(prev => ({ ...prev, userAnswers: newUserAnswers, score: newScore, isFinished: true }));
    } else {
      setState(prev => ({
        ...prev,
        userAnswers: newUserAnswers,
        score: newScore,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  }, [state, completedParts]);

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      score: 0,
      userAnswers: [],
      isFinished: false,
      selectedCategory: null,
      selectedLevel: null,
      selectedPart: null,
      isLoading: false,
      dynamicQuestions: []
    }));
    setActiveTab('home');
  };

  if (!state.userName) {
    return <Layout activeTab="home" setActiveTab={() => {}} userName={null}><LoginView onLogin={handleLogin} /></Layout>;
  }

  return (
    <Layout 
      onHomeClick={handleReset} 
      userName={state.userName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'settings' && (
        <SettingsView 
          userName={state.userName} 
          completedCount={completedParts.length} 
          onLogout={handleLogout} 
        />
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
           <h2 className="text-3xl font-black text-gray-800">તમારી શીખવાની સફર</h2>
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">કુલ પ્રોગ્રેસ</span>
                    <h3 className="text-2xl font-black text-blue-900">{completedParts.length} ભાગ પૂર્ણ</h3>
                 </div>
                 <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-xs font-black">
                    {Math.min(100, Math.round((completedParts.length / 900) * 100))}% સફળતા
                 </span>
              </div>
              <div className="w-full bg-gray-100 h-5 rounded-full overflow-hidden mb-10 shadow-inner">
                 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (completedParts.length / 900) * 100)}%` }}></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <span className="block text-3xl font-black text-blue-800">{completedParts.length}</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase">પૂરા કરેલ યુનિટ</span>
                 </div>
                 <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                    <span className="block text-3xl font-black text-green-800">{completedParts.length * 47}</span>
                    <span className="text-[10px] font-black text-green-600 uppercase">સોલ્વ કરેલ પ્રશ્નો</span>
                 </div>
                 <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
                    <span className="block text-3xl font-black text-yellow-800">૧૦૦%</span>
                    <span className="text-[10px] font-black text-yellow-600 uppercase">સચોટતા દર</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'home' && (
        <div className="max-w-6xl mx-auto space-y-10">
          {state.isLoading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
              <h3 className="text-2xl font-black text-gray-800">વેબસાઇટ ડેટા તૈયાર કરી રહી છે</h3>
              <p className="text-gray-500 mt-2">કૃપા કરીને થોડી ક્ષણ રાહ જુઓ...</p>
            </div>
          )}

          {!state.isLoading && !state.selectedCategory && !state.isFinished && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10 max-w-2xl">
                    <span className="bg-yellow-400 text-blue-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase mb-6 inline-block">OFFICIAL PREP PORTAL</span>
                    <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">તમારી સફળતા, અમારો લક્ષ્ય.</h2>
                    <p className="text-blue-100 text-xl font-medium mb-8 opacity-90">ગુજરાત પોલીસ ભરતી માટેનું સૌથી મોટું ઓનલાઇન ક્વિઝ પ્લેટફોર્મ.</p>
                    <div className="flex space-x-4">
                       <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-md">
                          <p className="text-[10px] font-black uppercase text-blue-200">યુઝર</p>
                          <p className="font-black">{state.userName}</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute right-0 bottom-0 opacity-10 text-[20rem] font-black translate-x-1/4 translate-y-1/4">LRD</div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat, i) => (
                  <button key={i} onClick={() => setState(prev => ({ ...prev, selectedCategory: cat.name }))} className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-blue-600 hover:shadow-xl transition-all flex flex-col items-start space-y-4 group">
                    <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-inner">{cat.icon}</div>
                    <div className="text-left">
                      <span className="block font-black text-2xl text-gray-800 mb-1">{cat.name}</span>
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">૧૦૦ લેસન ➔</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Invite Card - NEW */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 shadow-sm">
                <div className="flex items-center space-x-6">
                  <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md rotate-12">🎁</div>
                  <div>
                    <h3 className="text-2xl font-black text-yellow-900">મિત્રોને પણ સફળ બનાવો!</h3>
                    <p className="text-yellow-700 font-medium">આ વેબસાઇટ તમારા પોલીસની તૈયારી કરતા મિત્રો સાથે શેર કરો.</p>
                  </div>
                </div>
                <button 
                  onClick={handleAppShare}
                  className="bg-yellow-900 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 flex items-center space-x-3"
                >
                  <span>લિંક મોકલો</span>
                  <span className="text-xl">➔</span>
                </button>
              </div>
            </div>
          )}

          {!state.isLoading && state.selectedCategory && !state.selectedLevel && !state.isFinished && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
              <div className="flex items-center space-x-4">
                <button onClick={handleReset} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50">⬅️</button>
                <h2 className="text-3xl font-black text-gray-800">લેવલ પસંદ કરો</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[DifficultyLevel.BASIC, DifficultyLevel.MEDIUM, DifficultyLevel.ADVANCED].map((level, i) => (
                  <button key={i} onClick={() => setState(prev => ({ ...prev, selectedLevel: level }))} className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-50 hover:border-blue-600 transition-all text-center group shadow-sm active:scale-95">
                    <div className="text-4xl mb-4">{i === 0 ? '🌱' : i === 1 ? '🔥' : '🏆'}</div>
                    <span className="block text-xl font-black text-gray-800">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!state.isLoading && state.selectedLevel && !state.selectedPart && !state.isFinished && (
            <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500 pb-20 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                 <button onClick={() => setState(prev => ({ ...prev, selectedLevel: null }))} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">⬅️</button>
                 <h2 className="text-2xl font-black text-gray-800">પ્રેક્ટિસ સેટ પસંદ કરો</h2>
                 <div className="w-12"></div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
                  {Array.from({ length: 100 }, (_, i) => i + 1).map(p => {
                    const isCompleted = completedParts.includes(`${state.selectedCategory}-${state.selectedLevel}-${p}`);
                    return (
                      <button
                        key={p}
                        onClick={() => handleStartFinalQuiz(state.selectedCategory!, state.selectedLevel!, p)}
                        className={`py-5 rounded-2xl border-2 transition-all font-black text-sm flex flex-col items-center active:scale-90 ${
                          isCompleted 
                            ? 'bg-green-600 border-green-700 text-white shadow-lg' 
                            : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <span className="text-[9px] mb-1 opacity-50 uppercase">Part</span>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!state.isLoading && state.selectedPart && !state.isFinished && (
            <div className="max-w-3xl mx-auto">
               <QuizCard
                question={(state.dynamicQuestions.length > 0 ? state.dynamicQuestions : QUESTIONS)[state.currentQuestionIndex]}
                selectedAnswer={null}
                onAnswerSelect={handleAnswerSelect}
                currentIndex={state.currentQuestionIndex}
                totalQuestions={(state.dynamicQuestions.length > 0 ? state.dynamicQuestions : QUESTIONS).length}
              />
            </div>
          )}

          {!state.isLoading && state.isFinished && (
            <div className="max-w-4xl mx-auto">
              <ResultView
                score={state.score}
                totalQuestions={(state.dynamicQuestions.length > 0 ? state.dynamicQuestions : QUESTIONS).length}
                questions={state.dynamicQuestions.length > 0 ? state.dynamicQuestions : QUESTIONS}
                userAnswers={state.userAnswers}
                onReset={handleReset}
                userName={state.userName}
              />
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
