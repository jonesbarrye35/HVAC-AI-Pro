import React from 'react';
import { useApp } from '../context';
import { Role } from '../types';
import { LayoutDashboard, Calendar, Wrench, Users, LogOut, Menu, X, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SyncStatus = () => {
    const { isOnline, pendingSyncCount } = useApp();

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full text-xs font-medium text-slate-500">
                <WifiOff size={14} />
                <span>Offline</span>
            </div>
        );
    }

    if (pendingSyncCount > 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700 animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                <span>Syncing ({pendingSyncCount})</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
            <CheckCircle2 size={14} />
            <span>Synced</span>
        </div>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser, users } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const handleLogout = () => {
    // Simple toggle for demo purposes
    const nextUser = users.find(u => u.id !== currentUser.id) || users[0];
    setCurrentUser(nextUser);
    setIsSidebarOpen(false);
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-brand-50 text-brand-700 font-medium' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600 mr-2">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="font-bold text-xl text-brand-700 flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                HVAC Pro
            </div>
        </div>
        <SyncStatus />
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-0 z-30 bg-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:border-r border-slate-200 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 hidden md:flex items-center gap-2 text-brand-700 font-bold text-2xl">
           <Wrench className="h-8 w-8" />
           HVAC Pro
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
          {currentUser.role === Role.OWNER && (
            <>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/schedule" icon={Calendar} label="Schedule & Dispatch" />
              <NavItem to="/jobs" icon={Wrench} label="All Jobs" />
            </>
          )}

          {currentUser.role === Role.TECHNICIAN && (
             <>
               <NavItem to="/" icon={Wrench} label="My Jobs (Today)" />
               <NavItem to="/schedule" icon={Calendar} label="My Schedule" />
             </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm w-full px-2 py-2 rounded transition-colors"
          >
            <LogOut size={16} />
            Switch User (Demo)
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="hidden md:flex justify-end px-8 py-4">
             <SyncStatus />
        </div>
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pt-0">
           {children}
        </div>
      </main>
      
      {/* Mobile Floating Action Button (Tech) */}
      {currentUser.role === Role.TECHNICIAN && !location.pathname.includes('/jobs/') && (
        <Link to="/schedule" className="md:hidden fixed bottom-6 right-6 bg-brand-600 text-white p-4 rounded-full shadow-lg shadow-brand-200 z-40 hover:bg-brand-700">
          <Calendar size={24} />
        </Link>
      )}
    </div>
  );
};
