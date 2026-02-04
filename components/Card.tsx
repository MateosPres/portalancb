import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    emoji?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, emoji }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden 
                transition-all duration-300 border border-gray-100 dark:border-gray-700
                ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''} 
                ${className}
            `}
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