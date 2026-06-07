import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Calendar, Clock, User } from 'lucide-react';
import type { ActivityLog } from '../mockData';

interface ActivityLogsViewProps {
  activities: ActivityLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  // Sort by date newest first
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return sortedActivities.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
      
      return matchesSearch && matchesModule;
    });
  }, [sortedActivities, searchTerm, moduleFilter]);

  const getModuleBadgeColor = (mod: string) => {
    const badges = {
      Vendor: 'bg-green-50 text-green-700 border-green-100',
      RFQ: 'bg-blue-50 text-blue-700 border-blue-100',
      Quotation: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      Approval: 'bg-amber-50 text-amber-700 border-amber-100',
      PO: 'bg-purple-50 text-purple-700 border-purple-100',
      Invoice: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      System: 'bg-slate-50 text-slate-600 border-slate-100'
    };
    return badges[mod as keyof typeof badges] || badges.System;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Real-Time System Audit Logs</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify automated ledger events, transactions matches, and manager approvals timestamps.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action logs details, user agent accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Modules:</span>
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-bold"
          >
            <option value="All">All Modules</option>
            <option value="Vendor">Vendor</option>
            <option value="RFQ">RFQ</option>
            <option value="Quotation">Quotation</option>
            <option value="Approval">Approval</option>
            <option value="PO">Purchase Order</option>
            <option value="Invoice">Invoice</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      {/* Logs timeline list sheet */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-400">
            No audit logs captured for the selected search queries.
          </div>
        ) : (
          <div className="relative border-l border-slate-200 pl-6 space-y-6">
            {filteredActivities.map((log) => {
              const dateObj = new Date(log.timestamp);
              return (
                <div key={log.id} className="relative group text-xs">
                  {/* Indicator Dot */}
                  <span className="absolute -left-[30px] top-1.5 bg-white border-2 border-green-600 rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                    <span className="h-1.5 w-1.5 bg-green-600 rounded-full"></span>
                  </span>

                  {/* Log Card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 hover:border-slate-200 hover:bg-slate-100/30 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getModuleBadgeColor(log.module)}`}>
                          {log.module}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{log.id}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2.5 text-[9px] text-slate-400 font-semibold uppercase">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {dateObj.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p className="font-bold text-slate-700 text-xs leading-relaxed">{log.action}</p>
                    
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Audit Clearance User: {log.userId.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
