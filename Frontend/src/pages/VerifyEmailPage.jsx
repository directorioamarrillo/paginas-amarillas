import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export function VerifyEmailPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Si ya está verificado, redirigir
  if (user?.is_verified) {
    const next = new URLSearchParams(location.search).get("next") || "/dashboard";
    navigate(next, { replace: true });
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await authApi.verifyEmail(code);
      setSuccess("¡Cuenta verificada correctamente!");
      
      // Actualizar el estado del usuario localmente
      setUser({ ...user, is_verified: true });
      
      setTimeout(() => {
        const next = new URLSearchParams(location.search).get("next") || "/dashboard";
        navigate(next, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    
    try {
      await authApi.resendCode();
      setSuccess("Te hemos enviado un nuevo código al correo.");
    } catch (err) {
      setError("Error al reenviar el código. Intenta nuevamente.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Verifica tu cuenta</h2>
          <p className="text-center text-slate-500 mb-8 text-sm leading-relaxed">
            Hemos enviado un código de 6 dígitos a <br/>
            <span className="font-semibold text-slate-700">{user?.correo || "tu correo"}</span>. <br/>
            Ingrésalo abajo para activar todas las funciones.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3 text-sm">
              <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl tracking-widest text-center font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Verificar Cuenta"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">¿No recibiste el código?</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {resending ? "Reenviando..." : "Enviar de nuevo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
