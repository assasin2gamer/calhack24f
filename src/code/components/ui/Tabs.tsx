import React, { createContext, useContext, useState } from "react";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}> = ({ defaultValue, children, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
> = ({ children, value, className = "", ...props }) => {
  const context = useContext(TabsContext);
  if (!context)
    throw new Error("TabsTrigger must be used within a Tabs component");

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive
          ? "bg-white shadow text-gray-900"
          : "text-gray-600 hover:text-gray-900"
      } ${className}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { value: string }
> = ({ children, value, className = "", ...props }) => {
  const context = useContext(TabsContext);
  if (!context)
    throw new Error("TabsContent must be used within a Tabs component");

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};
