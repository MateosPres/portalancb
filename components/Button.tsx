import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    ...props 
}) => {
    const baseStyles = "font-semibold rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2";
    
    const variants = {
        primary: "bg-ancb-orange text-white hover:bg-orange-600 shadow-md hover:shadow-lg",
        // Changed secondary to be dark gray text/border by default for visibility on white/gray backgrounds
        secondary: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
            {...props}
        >
            {children}
        </button>
    );
};