"use client"

import { Home, CreditCard, Target, TrendingUp, Settings, LogOut, Tag, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transações",
    url: "/dashboard/transactions",
    icon: TrendingUp,
  },
  {
    title: "Contas e Cartões",
    url: "/dashboard/accounts",
    icon: CreditCard,
  },
  {
    title: "Metas",
    url: "/dashboard/goals",
    icon: Target,
  },
  {
    title: "Categorias",
    url: "/dashboard/categories",
    icon: Tag,
  },
  {
    title: "Família",
    url: "/dashboard/family",
    icon: Users,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
      redirect: true
    })
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">FinanceApp</h2>
            <p className="text-sm text-muted-foreground">Sistema Financeiro</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
