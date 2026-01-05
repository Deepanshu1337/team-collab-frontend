import * as React from "react"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({
  value: "",
  onValueChange: () => {},
});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue = "", value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;

    return (
      <TabsContext.Provider
        value={{
          value: currentValue,
          onValueChange: onValueChange || setInternalValue,
        }}
      >
        <div ref={ref} {...props} />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${className || ""}`}
      role="tablist"
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const { value: contextValue, onValueChange } = React.useContext(TabsContext);
    const isActive = contextValue === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        } ${className || ""}`}
        onClick={(e) => {
          onValueChange(value);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: contextValue } = React.useContext(TabsContext);

    if (contextValue !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ""}`}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsProps, TabsTriggerProps, TabsContentProps };
