// components/dashboard/sidebar/SidebarSection.tsx
import { ReactNode } from "react";

export function SidebarSection({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 px-4 flex flex-col items-center">
      <div className="w-full py-4">
        {children}
      </div>
    </div>
  );
}