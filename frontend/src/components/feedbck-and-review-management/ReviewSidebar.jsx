import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const ReviewSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 p-6 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 shrink-0 min-h-screen">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#14532d] rounded-xl flex items-center justify-center shadow-md border border-[#166534] shrink-0 overflow-hidden relative">
          <svg viewBox="0 0 100 100" className="w-10 h-10 absolute inset-0 m-auto mt-1" xmlns="http://www.w3.org/2000/svg">
            <polygon points="60,20 95,80 25,80" fill="#22c55e" />
            <polygon points="40,35 70,80 10,80" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="miter" />
            <rect x="55" y="65" width="15" height="15" fill="white" />
          </svg>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-slate-900 leading-tight tracking-tight">Smart Camping</h4>
        </div>
      </div>
      
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4 flex items-center gap-4 mb-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">N</div>
        <div>
          <p className="text-slate-900 font-bold leading-tight">Nethmi User</p>
          <p className="text-green-700 text-sm font-medium">Community Reviewer</p>
        </div>
      </div>
      
      <nav className="space-y-2 flex-col flex text-slate-600 font-medium">
        <button type="button" onClick={() => navigate("/")} className="text-left px-4 py-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 w-full flex items-center justify-between group">
          <span>Dashboard</span>
          <ChevronDown size={16} className="opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all text-green-600" />
        </button>
        <button type="button" onClick={() => navigate("/")} className="text-left px-4 py-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 w-full flex items-center justify-between group">
          <span>Campsites</span>
          <ChevronDown size={16} className="opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all text-green-600" />
        </button>
        <button type="button" onClick={() => navigate("/")} className="text-left px-4 py-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 w-full flex items-center justify-between group">
          <span>Equipment</span>
          <ChevronDown size={16} className="opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all text-green-600" />
        </button>
        <button type="button" onClick={() => navigate("/")} className="text-left px-4 py-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 w-full flex items-center justify-between group">
          <span>Guides</span>
          <ChevronDown size={16} className="opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all text-green-600" />
        </button>
      </nav>
    </aside>
  );
};

export default ReviewSidebar;
