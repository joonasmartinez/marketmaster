
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-[32px] shadow-2xl overflow-hidden transform transition-transform animate-[slideUp_0.3s_ease-out] z-10">
        <div className="flex flex-col items-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
        </div>
        <div className="px-6 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-10 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
