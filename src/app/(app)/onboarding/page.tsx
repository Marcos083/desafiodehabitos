import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePartnershipForm } from "@/features/partnerships/components/create-partnership-form";
import { JoinPartnershipForm } from "@/features/partnerships/components/join-partnership-form";
import { getCurrentPartnership } from "@/features/partnerships/queries";

export default async function OnboardingPage() {
  const partnership = await getCurrentPartnership();

  if (partnership) {
    redirect("/hoje");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Conecte com seu parceiro
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Hábitos funcionam melhor com accountability. Crie uma parceria ou
          entre numa existente.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Criar</TabsTrigger>
          <TabsTrigger value="join">Entrar</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Criar parceria</CardTitle>
              <CardDescription>
                Você gera o código e compartilha com seu parceiro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreatePartnershipForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Entrar numa parceria</CardTitle>
              <CardDescription>
                Use o código de 6 caracteres que seu parceiro te passou.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JoinPartnershipForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
