"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Shield,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Fingerprint,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";

// Interface para garantir que o TypeScript entenda os dados que vêm do serviço
interface IProfileData {
  id: number;
  nome: string;
  cpf?: string;
  email?: string;
  tipo_usuario: string;
}

export default function AccountDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Estado para armazenar os dados completos vindos da API (CPF, etc)
  const [profileData, setProfileData] = useState<IProfileData | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true); // Loading inicial da tela
  const [isSaving, setIsSaving] = useState(false); // Loading do botão salvar
  const [showPassword, setShowPassword] = useState(false);

  // Estados do Formulário de Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // 1. EFEITO PARA BUSCAR DADOS COMPLETOS (O PULO DO GATO 🐱)
  useEffect(() => {
    const fetchFullData = async () => {
      if (!user) return;

      try {
        setIsLoadingData(true);
        let data;

        if (user.tipo_usuario === "admin") {
          // Se for Admin, busca pelo ID usando o serviço que retorna o CPF
          data = await adminService.getAdminById(user.id);
        } else {
          // Se for User, tentamos pegar do contexto ou de um serviço futuro
          // Como o endpoint de user exige CPF na query, por enquanto usamos o user do contexto
          // Se você tiver um endpoint "getMe" sem parametros, usaria ele aqui.
          data = user;
        }

        // Atualiza o estado local com os dados frescos (incluindo CPF do admin)
        setProfileData(data);
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        toast.error("Não foi possível carregar todos os detalhes da conta.");
        // Fallback: usa os dados básicos do contexto se a API falhar
        setProfileData(user as unknown as IProfileData);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFullData();
  }, [user]);

  // Função blindada para formatar CPF
  const formatarCpf = (cpf: string | undefined | null) => {
    if (!cpf) return "Não informado";
    const cpfLimpo = String(cpf).replace(/\D/g, "");
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const isAdmin = user?.tipo_usuario === "admin";

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (novaSenha !== confirmarSenha) {
      toast.warning("As novas senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      toast.warning("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSaving(true);

    try {
      const dadosEnvio = {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      };

      if (isAdmin) {
        await adminService.updateAdminPassword(user.id, dadosEnvio);
        toast.success("Senha de administrador atualizada!");
      } else {
        await userService.updatePassword(dadosEnvio);
        toast.success("Senha atualizada com sucesso!");
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.detail ||
        "Erro ao atualizar senha. Verifique a senha atual.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAF9] pt-24 pb-12 px-6 md:px-12 font-poppins transition-all">
      <div className="max-w-6xl mx-auto w-full py-12">
        {/* --- HEADER DO PERFIL --- */}
        <div className="bg-white rounded-3xl p-8 shadow-sm shadow-tertiary/10 border border-tertiary/5 flex flex-col md:flex-row items-center gap-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-28 h-28 bg-quaternary rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg shadow-tertiary/10">
              <User className="w-12 h-12" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1 z-10">
            {/* Usa profileData aqui */}
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              {profileData.nome}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                  isAdmin
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-secondary/10 text-secondary border-secondary/20"
                }`}
              >
                {profileData.tipo_usuario}
              </span>
              <span className="text-sm text-tertiary font-medium">
                ID: #{profileData.id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- COLUNA 1: DADOS PESSOAIS --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm shadow-tertiary/10 border border-tertiary/5 h-full relative overflow-hidden">
              <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5" /> Meus Dados
              </h2>

              <div className="space-y-6">
                {/* Agora usamos profileData.cpf que veio da API */}
                {isAdmin ? (
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2 text-tertiary">
                      <Fingerprint className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        CPF (Login)
                      </span>
                    </div>
                    <div className="text-gray-700 font-medium bg-quaternary/30 px-4 py-3 rounded-xl border border-tertiary/10">
                      {formatarCpf(profileData.cpf)}
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2 text-tertiary">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        E-mail (Login)
                      </span>
                    </div>
                    <div
                      className="text-gray-700 font-medium bg-quaternary/30 px-4 py-3 rounded-xl border border-tertiary/10 truncate"
                      title={profileData.email}
                    >
                      {profileData.email || "E-mail não cadastrado"}
                    </div>
                  </div>
                )}

                <div className="group">
                  <div className="flex items-center gap-2 mb-2 text-tertiary">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Nível de Acesso
                    </span>
                  </div>
                  <div className="text-gray-700 font-medium bg-quaternary/30 px-4 py-3 rounded-xl border border-tertiary/10 capitalize flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${isAdmin ? "bg-primary" : "bg-secondary"}`}
                    ></div>
                    {profileData.tipo_usuario}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUNA 2: ALTERAR SENHA --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm shadow-tertiary/10 border border-tertiary/5 h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Segurança
                </h2>
              </div>
              <p className="text-sm text-tertiary mb-8">
                Atualize sua senha periodicamente para manter seu jardim seguro.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="bg-quaternary/40 text-primary text-sm p-4 rounded-2xl border border-primary/5 mb-6 flex gap-3 items-start">
                  <Shield className="w-5 h-5 shrink-0 mt-0.5 text-secondary" />
                  <p className="leading-relaxed">
                    Para sua segurança, exigimos a confirmação da senha atual
                    antes de realizar qualquer alteração nas credenciais.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary/80 ml-1">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        required
                        placeholder="Digite sua senha atual"
                        className="h-12 bg-gray-50/50 border-tertiary/20 focus:border-primary focus:ring-primary/10 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-primary/80 ml-1">
                        Nova Senha
                      </label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="h-12 bg-gray-50/50 border-tertiary/20 focus:border-primary focus:ring-primary/10 rounded-xl transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-primary/80 ml-1">
                        Confirmar Nova Senha
                      </label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                        placeholder="Repita a nova senha"
                        className={`h-12 bg-gray-50/50 rounded-xl transition-all ${
                          confirmarSenha && novaSenha !== confirmarSenha
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-tertiary/20 focus:border-primary focus:ring-primary/10"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-tertiary/5 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-tertiary hover:text-primary flex items-center gap-2 transition-colors px-2 py-1 font-medium"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {showPassword ? "Ocultar caracteres" : "Mostrar senhas"}
                  </button>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full md:w-auto bg-primary hover:bg-secondary text-white rounded-xl px-8 h-12 shadow-lg shadow-tertiary/20 hover:shadow-tertiary/30 transition-all font-semibold tracking-wide"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
