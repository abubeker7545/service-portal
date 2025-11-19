import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:inset-0">
      <div className={`relative w-full ${maxWidth} max-h-full rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b p-4 md:p-5">
          <h3 className="text-xl font-semibold text-slate-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-slate-400 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-5 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};