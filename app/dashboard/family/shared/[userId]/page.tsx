"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MemberDashboardView } from "@/components/member-dashboard-view";
import { useMemberViewStore } from "@/store/use-member-view-store";

export default function MemberViewPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { memberData, isLoading, clearMemberData } = useMemberViewStore();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Aguardar um pouco para o componente filho carregar os dados
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearMemberData();
    };
  }, [clearMemberData]);

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/family/shared")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isLoading || initialLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <div>
                <h1 className="text-2xl font-bold">Carregando...</h1>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto buscamos os dados
                </p>
              </div>
            </div>
          ) : memberData ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={memberData.user.image || undefined} />
                <AvatarFallback>
                  {getInitials(memberData.user.name, memberData.user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {memberData.user.name || "Sem nome"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visualizando dados compartilhados
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">Dados do Membro</h1>
              <p className="text-sm text-muted-foreground">
                Visualização de dados compartilhados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <MemberDashboardView userId={params.userId} />
    </div>
  );
}

