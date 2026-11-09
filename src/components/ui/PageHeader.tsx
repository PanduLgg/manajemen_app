import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E6DFF1] rounded-[8px] my-4">
      <div className="p-3 bg-[#EEE4FA] text-[#8650C4] rounded-full mb-3">
        {icon || <Inbox className="w-6 h-6" strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-semibold text-[#2D2640]">{title}</h3>
      {description && <p className="text-sm text-[#6B6480] max-w-[45ch] mt-1">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, badge }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFF1] mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-[#2D2640] tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-[#6B6480] mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};
