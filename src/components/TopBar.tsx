import React, { useState } from 'react';
import { Bell, Search, ChevronDown, CheckCircle2, ShieldCheck, Sun, Moon, Menu } from 'lucide-react';
import type { ActivityLog } from '../mockData';

interface TopBarProps {
  userRole: string;
  currentUser: { firstName: string; lastName: string; email: string };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  activities: ActivityLog[];
}

export const TopBar: React.FC<TopBarProps> = ({
  userRole,
  currentUser,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  setIsDarkMode,
  setSidebarOpen,
  activities
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Map the activities dynamically to notifications
  const notifications = (activities || []).slice(0, 5).map((act) => {
    let type = 'info';
    let title = 'System Log';
    
    if (act.module === 'Approval' || act.module === 'PO') {
      type = 'success';
      title = `${act.module} Succeeded`;
    } else if (act.module === 'RFQ' || act.module === 'Quotation') {
      title = `${act.module} Event`;
    } else if (act.module === 'Vendor') {
      title = `Vendor Logged`;
    }
    
    // Relative time string helper
    const timeDiff = Date.now() - new Date(act.timestamp).getTime();
    let timeLabel = 'Just now';
    if (timeDiff > 60000) {
      const mins = Math.floor(timeDiff / 60000);
      if (mins < 60) {
        timeLabel = `${mins} min${mins > 1 ? 's' : ''} ago`;
      } else {
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) {
          timeLabel = `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
        } else {
          timeLabel = new Date(act.timestamp).toLocaleDateString();
        }
      }
    }
    
    return {
      id: act.id,
      title,
      description: act.action,
      time: timeLabel,
      type
    };
  });

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 w-full ml-0 lg:w-[calc(100%-16rem)] lg:ml-64 no-print transition-all duration-200">
      {/* Mobile Hamburger menu */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="p-1.5 mr-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg lg:hidden transition-all focus:outline-none"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search dashboard, vendors, RFQs, POs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition-all focus:outline-none"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-5.5 w-5.5 text-amber-500" /> : <Moon className="h-5.5 w-5.5" />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleDropdown(false);
            }}
            className="relative p-1.5 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition-all focus:outline-none"
          >
            <Bell className="h-5.5 w-5.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-green-600 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800 dark:text-zinc-100">Notifications</span>
                <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full font-medium">{notifications.length} New</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-b border-slate-50 dark:border-zinc-800 last:border-b-0 cursor-pointer transition-colors">
                      <div className="flex items-start space-x-3">
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{notif.title}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{notif.description}</p>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium block mt-1">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-zinc-800 p-1.5 rounded-lg transition-all focus:outline-none"
          >
            <div className="h-8 w-8 bg-green-100 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800/35 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-sm shadow-sm">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 leading-tight">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 tracking-wide uppercase mt-0.5">
                {userRole}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-zinc-400 shrink-0" />
          </button>

          {/* User Role Info Dropdown */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3">
                <span className="font-semibold text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Logged In Agent</span>
                <span className="font-bold text-xs text-slate-700 dark:text-zinc-200 block mt-1">{currentUser.email}</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mt-2">Role: {userRole}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
