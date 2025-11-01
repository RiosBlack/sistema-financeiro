"use client"

import { Home, CreditCard, Target, Settings, LogOut, Tag, Users, TrendingUp } from "lucide-react"
import Image from "next/image"
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
          <div className="relative h-10 w-10">
            <Image
              src="/logo.png"
              alt="Logo PigPay"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">PigPay</h2>
            <p className="text-sm text-muted-foreground">Gestão Financeira</p>
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
