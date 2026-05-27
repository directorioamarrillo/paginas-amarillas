import React, { useState } from "react";
import "../../styles/form.css";
import axios from "axios";
import { axiosInstance } from "../../utils/axiosInstance";

export function VerificarCuenta() {
  const [statusForm, setStatusForm] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
    message: string | null;
  }>({
    isLoading: false,
    error: null,
    success: false,
    message: null,
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusForm((prev) => ({ ...prev, isLoading: true, error: null, message: null }));
    const formData = new FormData(e.currentTarget);
    const code = formData.get("codigo") as string;

    if (!code || code.length < 5) {
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: 'Por favor ingresa el código completo.' }));
      return;
    }

    try {
      // Necesitamos enviar el JWT token actual con esta petición.
      // axiosInstance ya debería adjuntarlo desde las cookies si está configurado para credentials: true,
      // o a través de un interceptor.
      const { data } = await axiosInstance("/api/verify-email", {
        method: "POST",
        data: { code: code.trim() },
      });

      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
        message: "¡Cuenta verificada con éxito! Redirigiendo...",
      }));

      // Marcar en la cookie que ya está verificado
      try {
        const setCookieFn = (await import('../../utils/cookies')).setCookie;
        setCookieFn('is_verified', 'true', 7);
      } catch (e) {
        document.cookie = `is_verified=true; path=/; SameSite=Strict`;
      }

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      
    } catch (error: any) {
      console.error('VerificarCuenta error:', error);
      const isAxios = axios.isAxiosError(error);
      if (isAxios && error.response) {
        const message = error.response?.data?.detail || 'Ocurrió un error al verificar el código.';
        setStatusForm((prev) => ({ ...prev, isLoading: false, error: message }));
        return;
      }
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: 'Ocurrió un error inesperado de conexión.' }));
    }
  };

  const handleResend = async () => {
    setStatusForm((prev) => ({ ...prev, isLoading: true, error: null, message: null }));
    try {
      const { data } = await axiosInstance("/api/resend-code", {
        method: "POST",
      });
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        message: data.message || "Se ha enviado un nuevo código a tu correo.",
      }));
    } catch (error: any) {
      console.error('ResendCode error:', error);
      const isAxios = axios.isAxiosError(error);
      if (isAxios && error.response) {
        const message = error.response?.data?.detail || 'Error al reenviar el código.';
        setStatusForm((prev) => ({ ...prev, isLoading: false, error: message }));
        return;
      }
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: 'Error de conexión al reenviar.' }));
    }
  };

  return (
    <form className="content-form" onSubmit={onSubmit}>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
        Hemos enviado un código de seguridad a tu correo electrónico. 
        Por favor, ingrésalo a continuación para activar tu cuenta.
      </p>

      <div className="content-input">
        <label htmlFor="codigo">Código de Verificación</label>
        <input
          type="text"
          name="codigo"
          required
          id="codigo"
          placeholder="Ej: 123456"
          maxLength={6}
          style={{ textAlign: "center", letterSpacing: "5px", fontSize: "1.2rem" }}
        />
      </div>

      {statusForm.error && (
        <span className="error-form" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>
          {statusForm.error}
        </span>
      )}

      {statusForm.message && !statusForm.error && (
        <span className="success-form" style={{ display: 'block', textAlign: 'center', marginTop: '10px', color: 'green' }}>
          {statusForm.message}
        </span>
      )}

      <div className="content-submit" style={{ marginTop: "20px" }}>
        <button type="submit" disabled={statusForm.isLoading}>
          {statusForm.isLoading ? "Verificando..." : "Verificar Cuenta"}
        </button>
      </div>

      <div className="content-login-link" style={{ marginTop: "20px", textAlign: "center" }}>
        <span>¿No recibiste el código? </span>
        <button 
          type="button" 
          onClick={handleResend} 
          disabled={statusForm.isLoading}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#0066cc", 
            textDecoration: "underline", 
            cursor: "pointer", 
            padding: 0,
            fontSize: "inherit" 
          }}
        >
          Reenviar código
        </button>
      </div>
    </form>
  );
}
