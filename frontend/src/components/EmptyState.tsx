import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center my-6">
      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
