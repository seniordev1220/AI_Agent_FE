// components/dashboard/sidebar/SidebarNavList.tsx
import { SidebarNavItem } from "./sidebarNavItem";
import { sidebarNav, automationNav, bottomNav, aiAgents } from "./sidebarData";
import { SidebarAgentsSection } from "./sidebarAgentsSection";

export function SidebarNavList({ items }: { items: { label: string, icon: string, href: string }[] }) {
  // Split items into two parts: before and after AI Agents section
  const beforeAgents = items.slice(0, 1); // Get Dashboard
  const afterAgents = items.slice(1);  // Get remaining items

  return (
    <nav className="flex flex-col h-full">  {/* Added h-full to ensure full height */}
      {/* Main navigation */}
      <div className="px-3 py-2">
        {beforeAgents.map(item => (
          <SidebarNavItem key={item.label} {...item} />
        ))}
        
        {/* Insert AI Agents section */}
        <SidebarAgentsSection agents={aiAgents} />
        
        {/* Render remaining nav items */}
        {afterAgents.map(item => (
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