"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Key,
  Save,
  ArrowLeft,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

// Componente interno para suspender o uso do useSearchParams (necessário no Next.js App Router)
function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pegando dados da URL (ex: ?id=11&nome=Admin)
  const idParam = searchParams.get("id");
  const nomeParam = searchParams.get("nome") || "Administrador";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle para ver senhas
  
  // Form State
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idParam) {
      toast.error("ID do administrador não identificado.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.warning("As novas senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      toast.warning("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      await adminService.updateAdminPassword(idParam, {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });

      toast.success("Senha alterada com sucesso!");
      
      // Delay pequeno para o usuário ler o toast antes de voltar
      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      // Tratamento básico de erro da API
      if (error.response?.status === 400 || error.response?.status === 401) {
         toast.error("Senha atual incorreta ou dados inválidos.");
      } else {
         toast.error("Erro ao alterar a senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* --- CABEÇALHO --- */}
      <div className="bg-primary pt-10 pb-24 px-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={() => router.back()}
            variant="ghost" 
            className="text-white/70 hover:text-white hover:bg-white/10 -ml-4 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciar Admins
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Alterar Senha
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Atualizando credenciais para: <strong className="text-white">{nomeParam}</strong> (ID: {idParam})
          </p>
        </div>
      </div>

      {/* --- CARD FLUTUANTE DE FORMULÁRIO --- */}
      <div className="flex-1 px-6 -mt-16 mb-20">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl shadow-tertiary/10 border border-tertiary/5 overflow-hidden">
          
          <div className="p-8">
            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Para confirmar essa operação, a API exige a <strong>senha atual</strong> do administrador selecionado.
              </p>
            </div>

            <form onSubmit={handleSalvar} className="space-y-6">
              
              {/* Campo: Senha Atual */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-tertiary flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite a senha atual deste admin"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-tertiary/20 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-primary"
                  />
                </div>
              </div>

              <div className="h-px bg-tertiary/10 my-2" />

              {/* Campo: Nova Senha */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-tertiary flex items-center gap-2">
                  <Key className="w-4 h-4" /> Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite a nova senha"
                    required
                    minLength={6}
                    className="w-full h-12 px-4 rounded-xl border border-tertiary/20 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-tertiary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Campo: Confirmar Nova Senha */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-tertiary">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  className={`w-full h-12 px-4 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none text-primary ${
                    confirmarSenha && novaSenha !== confirmarSenha
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-tertiary/20 focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {confirmarSenha && novaSenha !== confirmarSenha && (
                  <p className="text-xs text-red-500 mt-1 ml-1">As senhas não coincidem.</p>
                )}
              </div>

              {/* Botão Salvar */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary hover:bg-secondary text-white text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Atualizar Senha
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper principal com Suspense para evitar erro de build no Next.js ao usar useSearchParams
export default function ChangeAdminPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ChangePasswordContent />
    </Suspense>
  );
}