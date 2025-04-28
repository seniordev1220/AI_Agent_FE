// components/dashboard/sidebar/sidebarData.ts
// Main navigation items
export const sidebarNav = [
    { label: "Dashboard", icon: "home", href: "/dashboard" },
    { label: "All Chats", icon: "message-square", href: "/dashboard/chats" },
    { label: "API keys", icon: "key", href: "/dashboard/api-keys" },
    { label: "Models", icon: "cpu", href: "/dashboard/models" },
];

// Automation section items
export const automationNav = [
    { label: "Data & Knowledge Base", icon: "folder", href: "/dashboard/data" },
    { label: "My Agents", icon: "users", href: "/dashboard/my-agents" },
    { label: "Integrations", icon: "share", href: "/dashboard/integrations" },
];

// Bottom section items
export const bottomNav = [
    { label: "+ Invite team members", icon: "users-plus", href: "/dashboard/invite" },
    { label: "Billing", icon: "credit-card", href: "/dashboard/billing" },
];

export const aiAgents = [
    { name: "Sales Agent", description: "Sales price targeted metric..", avatar: "/avatars/sales.png" },
    { name: "Content Writer", description: "All website SEO blogs..", avatar: "/avatars/content.png" },
    { name: "Code Assistant", description: "Git version control....", avatar: "/avatars/code.png" },
];