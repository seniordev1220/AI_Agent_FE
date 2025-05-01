// components/dashboard/sidebar/SidebarSection.tsx
import { ReactNode } from "react";

interface SidebarSectionProps {
  children: ReactNode;
  className?: string;
}

export function SidebarSection({ children, className }: SidebarSectionProps) {
  return (
    <div className={`mb-2 px-4 flex flex-col items-center ${className || ''}`}>
      <div className="w-full py-4">
        {children}
      </div>
    </div>
  );
}