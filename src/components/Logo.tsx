import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  href = '/'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const innerSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} bg-black rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
      <div className={`${innerSizeClasses[size]} bg-white rounded-sm`}></div>
    </div>
  );

  const LogoContent = () => (
    <div className={`flex items-center space-x-2 cursor-pointer group transition-all duration-200 ${className}`}>
      <LogoIcon />
      {showText && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200`}>
          Notopy
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;