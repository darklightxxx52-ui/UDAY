
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick?: () => void;
  userName?: string | null;
  activeTab: 'home' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'stats' | 'settings') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onHomeClick, 
  userName,
  activeTab,
  setActiveTab
}) => {
  const NavItem = ({ id, label, icon }: { id: any, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-200 w-full ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-black uppercase tracking-wider text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 sticky top-0 h-screen p-6">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="bg-yellow-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-blue-900 font-black text-xl">GP</span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-blue-900">LRD ક્વિઝ</h1>
        </div>

        <nav className="flex-grow space-y-2">
          <NavItem id="home" label="હોમ પેજ" icon="🏠" />
          <NavItem id="stats" label="પ્રોગ્રેસ રિપોર્ટ" icon="📊" />
          <NavItem id="settings" label="સેટિંગ્સ" icon="⚙️" />
        </nav>

        {userName && (
          <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-black">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-xs truncate">{userName}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase">ઓનલાઇન</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="md:hidden bg-blue-900 text-white shadow-lg sticky top-0 z-50 px-4 py-3">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-blue-900 font-black text-sm">GP</span>
              </div>
              <h1 className="text-md font-black">LRD ક્વિઝ માસ્ટર</h1>
            </div>
            {userName && <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">{userName}</span>}
          </div>
        </header>
        
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-10">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className="text-2xl">🏠</span>
            <span className="text-[10px] font-black">હોમ</span>
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center space-y-1 ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className="text-2xl">📊</span>
            <span className="text-[10px] font-black">પ્રોગ્રેસ</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center space-y-1 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className="text-2xl">⚙️</span>
            <span className="text-[10px] font-black">સેટિંગ્સ</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
