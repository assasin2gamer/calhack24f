import React from 'react';

export const Separator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`h-px bg-gray-200 ${className}`} {...props} />;
};
