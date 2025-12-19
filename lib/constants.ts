export const APP_NAME = "Biznify"

export const NAVIGATION_ITEMS = [
  {
    title: "Ask Biznify AI",
    href: "/ai",
    icon: "Bot",
  },
  {
    title: "Dashboard",
    href: "/",
    icon: "Home",
  },
  {
    title: "Legal",
    href: "/legal/overview",
    icon: "FileText",
    subItems: [
      { title: "Overview", href: "/legal/overview" },
      { title: "Contracts", href: "/legal/contracts" },
      { title: "Requirements", href: "/legal/requirements" },
      { title: "Compliance", href: "/legal/compliance" },
    ]
  },
  {
    title: "Marketing",
    href: "/marketing/overview",
    icon: "Megaphone",
    subItems: [
      { title: "Overview", href: "/marketing/overview" },
      { title: "Campaigns", href: "/marketing/campaigns" },
      { title: "Brand Store", href: "/marketing/analytics" },
      { title: "Content", href: "/marketing/content" },
    ]
  },
  {
    title: "Sales CRM",
    href: "/sales/overview",
    icon: "Users",
    subItems: [
      { title: "Overview", href: "/sales/overview" },
      { title: "Contacts", href: "/sales/contacts" },
      { title: "Accounts", href: "/sales/accounts" },
      { title: "Deals", href: "/sales/deals" },
    ]
  },
  {
    title: "Finance",
    href: "/finance/overview",
    icon: "DollarSign",
    subItems: [
      { title: "Overview", href: "/finance/overview" },
      { title: "Invoices", href: "/finance/invoices" },
      { title: "Expenses", href: "/finance/expenses" },
      { title: "Financial Planning", href: "/finance/budget-forecast" },
      { title: "Investment", href: "/finance/investment" },
    ]
  },
  {
    title: "HR",
    href: "/hr/overview",
    icon: "UserCheck",
    subItems: [
      { title: "Overview", href: "/hr/overview" },
      { title: "Employees", href: "/hr/employees" },
      { title: "Recruitment", href: "/hr/recruitment" },
      { title: "Time Manager", href: "/hr/time-manager" },
    ]
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: "Settings",
  },

  // Future modules can be added here
] as const

export const LEGAL_DOCUMENTS = [
  {
    id: "terms",
    title: "Terms of Service",
    description: "Our terms and conditions for using Biznify",
    lastUpdated: "2024-01-15",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data",
    lastUpdated: "2024-01-15",
  },
] as const 