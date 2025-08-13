import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
