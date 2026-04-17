import React, { useEffect } from 'react';
import { LucideX } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    zIndex?: number;
    maxWidthClassName?: string;
    bodyClassName?: string;
    maxHeightClassName?: string;
    scrollable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    zIndex = 100,
    maxWidthClassName = 'max-w-lg',
    bodyClassName = 'p-6',
    maxHeightClassName = 'max-h-[90vh]',
    scrollable = true,
}) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 animate-fadeIn" style={{ zIndex }}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${maxWidthClassName} ${maxHeightClassName} overflow-visible flex flex-col animate-slideUp transition-colors duration-300`}>
                <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors duration-300 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <LucideX size={20} />
                    </button>
                </div>
                
                <div className={`${scrollable ? 'overflow-y-auto' : 'overflow-visible'} ${scrollable ? 'min-h-0' : ''} ${bodyClassName}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};