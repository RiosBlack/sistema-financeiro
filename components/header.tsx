"use client"

import { useEffect } from "react"
import { Bell, User, LogOut, Check, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useFamilyStore } from "@/store/use-family-store"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { invitations, pendingInvitationsCount, fetchInvitations, acceptInvitation, rejectInvitation } = useFamilyStore()

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    })
  }

  const handleAcceptInvitation = async (id: string) => {
    await acceptInvitation(id)
  }

  const handleRejectInvitation = async (id: string) => {
    await rejectInvitation(id)
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {pendingInvitationsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingInvitationsCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Convites de Família</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {invitations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum convite pendente
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-3 border-b last:border-0">
                    <div className="flex items-start gap-2 mb-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{invitation.family.name}</p>
                        <p className="text-muted-foreground">
                          Convidado por {invitation.inviter.name || invitation.inviter.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRejectInvitation(invitation.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || "email@exemplo.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
