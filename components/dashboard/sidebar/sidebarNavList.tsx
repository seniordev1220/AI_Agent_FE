// components/dashboard/sidebar/SidebarNavList.tsx
import { SidebarNavItem } from "./sidebarNavItem";
import { sidebarNav, automationNav, bottomNav } from "./sidebarData";
import { SidebarAgentsSection } from "./sidebarAgentsSection";

export function SidebarNavList({ items }: { items: { label: string, icon: string, href: string }[] }) {
  
  return (
    <nav className="flex flex-col h-full">  {/* Added h-full to ensure full height */}
      {/* Main navigation */}
      <div className="px-3 py-2">
        {sidebarNav.map(item => (
          <SidebarNavItem key={item.label} {...item} />
        ))}
      </div>

      {/* Automations section */}
      <div className="px-3 mt-4">
        <h3 className="px-3 mb-2 text-sm text-gray-500">Automations</h3>
        {automationNav.map(item => (
          <SidebarNavItem key={item.label} {...item} />
        ))}
      </div>

      {/* Bottom section - pushed to bottom with margin-top auto */}
      <div className="px-3 mt-10 mb-4 border-t border-gray-200">
        {bottomNav.map(item => (
          <SidebarNavItem key={item.label} {...item} />
        ))}
      </div>
    </nav>
  );
}