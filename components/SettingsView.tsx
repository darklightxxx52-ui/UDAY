
import React from 'react';

interface SettingsViewProps {
  userName: string;
  completedCount: number;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userName, completedCount, onLogout }) => {
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
        alert('શેર કરવા માટેની લિંક કોપી થઈ ગઈ છે!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl text-white font-black shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">{userName}</h2>
            <p className="text-sm text-blue-600 font-bold">LRD એસ્પિરન્ટ</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
          <div className="text-center">
            <span className="block text-2xl font-black text-gray-800">{completedCount}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase">પૂરા કરેલ ભાગ</span>
          </div>
          <div className="text-center border-l border-gray-50">
            <span className="block text-2xl font-black text-gray-800">૪૭૦૦+</span>
            <span className="text-[10px] font-black text-gray-400 uppercase">કુલ પ્રશ્નો</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <button 
          onClick={handleAppShare}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-gray-50 group"
        >
          <div className="flex items-center space-x-4">
            <span className="text-2xl group-hover:scale-125 transition-transform">📢</span>
            <div className="text-left">
              <span className="block font-black text-gray-800">મિત્રો સાથે શેર કરો</span>
              <span className="text-[10px] text-blue-600 font-black uppercase">WhatsApp પર મોકલો</span>
            </div>
          </div>
          <span className="text-gray-300">➔</span>
        </button>
        
        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-gray-700">પ્રાઈવસી પોલીસી</span>
          </div>
          <span className="text-gray-300">➔</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-colors text-red-600"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🚪</span>
            <span className="font-black">લોગ આઉટ</span>
          </div>
        </button>
      </div>

      <div className="text-center p-4">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Version 1.2.0 (Live Web)</p>
        <p className="text-gray-300 text-[8px] mt-1">તમારા સપના, અમારી મહેનત.</p>
      </div>
    </div>
  );
};

export default SettingsView;
