import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onTouchStart?: () => void;
    emoji?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, onMouseEnter, onFocus, onTouchStart, emoji }) => {
    return (
        <div 
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onFocus={onFocus}
            onTouchStart={onTouchStart}
            className={`
                bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden 
                transition-all duration-300 border border-gray-100 dark:border-gray-700
                ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''} 
                ${className}
            `}
            tabIndex={onFocus ? 0 : undefined}
        >
            <div className="relative z-10">
                {children}
            </div>
            
            {emoji && (
                <div className="absolute -right-5 -bottom-8 text-[100px] opacity-[0.08] dark:opacity-[0.05] rotate-[-15deg] select-none pointer-events-none z-0">
                    {emoji}
                </div>
            )}
        </div>
    );
};