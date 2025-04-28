// components/dashboard/sidebar/SidebarNavItem.tsx
import Link from "next/link";
import { 
  Home, 
  Bot, 
  MessageSquare, 
  Key, 
  Cpu, 
  Folder, 
  Users, 
  Share,
  UserPlus,
  CreditCard
} from "lucide-react";

const icons = {
  home: Home,
  bot: Bot,
  "message-square": MessageSquare,
  key: Key,
  cpu: Cpu,
  folder: Folder,
  users: Users,
  share: Share,
  "users-plus": UserPlus,
  "credit-card": CreditCard,
};

export function SidebarNavItem({ label, icon, href }: { label: string, icon: string, href: string }) {
  const Icon = icons[icon as keyof typeof icons];
  return (
    <Link 
      href={href} 
      className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 text-sm font-medium"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}