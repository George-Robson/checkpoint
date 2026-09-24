import type { ReactNode } from 'react';

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}

export function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-slate-900">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Edit
        </button>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
