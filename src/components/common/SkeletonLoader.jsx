import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-200 rounded-md w-full"></div>
        <div className="h-3 bg-slate-200 rounded-md w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-200 rounded-lg w-24"></div>
        <div className="h-9 bg-slate-200 rounded-xl w-28"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 animate-pulse">
      <div className="flex items-center gap-3 w-1/3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-20"></div>
      <div className="h-6 bg-slate-200 rounded-full w-24"></div>
      <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
    </div>
  );
}
