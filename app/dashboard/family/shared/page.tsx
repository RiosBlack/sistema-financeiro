"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/store/use-family-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Crown, Users, Eye } from "lucide-react";

export default function SharedDataPage() {
  const router = useRouter();
  const { family, fetchFamily } = useFamilyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFamily = async () => {
      setLoading(true);
      await fetchFamily();
      setLoading(false);
    };
    loadFamily();
  }, [fetchFamily]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/family")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Você não está em uma família.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dados Compartilhados</h1>
          <p className="text-muted-foreground">
            Visualize os dados financeiros compartilhados pelos membros da família
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/family")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Família</CardTitle>
          <CardDescription>
            Clique em um membro para visualizar seus dados financeiros compartilhados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.members.map((member) => (
              <Card
                key={member.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() =>
                  router.push(`/dashboard/family/shared/${member.userId}`)
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>
                        {getInitials(member.user.name, member.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {member.user.name || "Sem nome"}
                        </h3>
                        {member.role === "OWNER" && (
                          <Crown className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                      <Badge
                        variant={member.role === "OWNER" ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {member.role === "OWNER" ? "Administrador" : "Membro"}
                      </Badge>
                    </div>
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {family.members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro na família ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

