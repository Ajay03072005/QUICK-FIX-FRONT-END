import React from 'react';
import { SearchX, Inbox, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = SearchX,
  title = "No items found",
  description = "Try adjusting your filters or search terms.",
  actionLabel = null,
  actionPath = null,
  onAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-white rounded-2xl border border-slate-200/80 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      
      {actionLabel && actionPath && (
        <Link
          to={actionPath}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionPath && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
