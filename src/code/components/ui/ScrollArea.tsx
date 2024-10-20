import React from "react";

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`overflow-auto ${className}`} {...props}>
      {children}
    </div>
  );
};
