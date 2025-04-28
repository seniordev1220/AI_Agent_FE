// components/dashboard/sidebar/SidebarAgentItem.tsx
import Image from "next/image";

export function SidebarAgentItem({ name, description, avatar }: { name: string, description: string, avatar: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <Image src={avatar} alt={name} width={32} height={32} className="rounded-full" />
      <div>
        <div className="text-[15px] font-medium">{name}</div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]">{description}</div>
      </div>
    </div>
  );
}