import React, { useState } from "react";
import "../../styles/form.css";
import axios from "axios";
import { axiosInstance } from "../../utils/axiosInstance";

export function InicioSesion() {
  const [statusForm, setStatusForm] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
  }>({
    isLoading: false,
    error: null,
    success: false,
  });
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusForm((prev) => ({ ...prev, isLoading: true, error: null }));
    const formData = new FormData(e.currentTarget);

    const formDataObj: Record<string, string> = {};
    for (let [key, value] of formData.entries()) {
      formDataObj[key] = value as string;
    }

    // Validaciones cliente (rápidas)
    if (!formDataObj.correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formDataObj.correo)) {
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: 'Por favor ingresa un correo válido.' }));
      return;
    }
    if (!formDataObj.password || formDataObj.password.length < 6) {
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: 'La contraseña debe tener al menos 6 caracteres.' }));
      return;
    }

    try {
      const { data } = await axiosInstance("/api/signin", {
        method: "POST",
        data: formDataObj,
      });
      console.log({ data });
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));

      // Guardar cookies con helper para consistencia
      try {
        // Se usa setCookie helper si está disponible en tiempo de ejecución
        const setCookieFn = (await import('../../utils/cookies')).setCookie;
        setCookieFn('token', data.access_token, 7);
        setCookieFn('rol', data.rol, 7);
        setCookieFn('id_usuario', String(data.id_usuario), 7);
      } catch (e) {
        // fallback directo en caso que import dinámico falle
        document.cookie = `token=${data.access_token}; path=/; SameSite=Strict`;
        document.cookie = `rol=${data.rol}; path=/; SameSite=Strict`;
        document.cookie = `id_usuario=${data.id_usuario}; path=/; SameSite=Strict`;
      }
      
      if (data.is_verified === false) {
        window.location.href = "/verificar";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error('InicioSesion error:', error);
      // Determine development or demo-forced flag safely
      const isDev = ((import.meta as any)?.env?.DEV) ?? false;
      const forceDemo = isDev || (((import.meta as any)?.env?.PUBLIC_FORCE_DEMO) === 'true');

      const isAxios = axios.isAxiosError(error);
      const noResponse = isAxios ? !error.response : true;

      // If there's no response from server (network error) and we're in dev or demo-forced, simulate success
      if (noResponse && forceDemo) {
        const fakeData = {
          access_token: 'fake-token-12345',
          rol: 'user',
          id_usuario: 9999,
        };
        try {
          const setCookieFn = (await import('../../utils/cookies')).setCookie;
          setCookieFn('token', fakeData.access_token, 7);
          setCookieFn('rol', fakeData.rol, 7);
          setCookieFn('id_usuario', String(fakeData.id_usuario), 7);
        } catch (e) {
          document.cookie = `token=${fakeData.access_token}; path=/; SameSite=Strict`;
          document.cookie = `rol=${fakeData.rol}; path=/; SameSite=Strict`;
          document.cookie = `id_usuario=${fakeData.id_usuario}; path=/; SameSite=Strict`;
        }
        setStatusForm((prev) => ({ ...prev, isLoading: false, success: true, error: null }));
        window.location.href = '/verificar'; // In demo mode, assume verification is needed to show the flow
        return;
      }

      // If axios with response, show server message
      if (isAxios && error.response) {
        const message = error.response?.data?.detail || error.message || 'Ocurrió un error inesperado.';
        setStatusForm((prev) => ({ ...prev, isLoading: false, error: message }));
        return;
      }

      // If network error and not in demo mode, show clearer message
      if (noResponse && !forceDemo) {
        setStatusForm((prev) => ({ ...prev, isLoading: false, error: 'No hay conexión con el backend. Inicia el servidor API o activa el modo demo.' }));
        return;
      }

      // Fallback generic message
      const genericMsg = error?.message || 'Ocurrió un error inesperado.';
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: genericMsg }));
    }
  };

  return (
    <form className="content-form" onSubmit={onSubmit}>
      <div className="content-input">
        <label htmlFor="correo_electronico">Correo electrónico</label>
        <input
          type="email"
          name="correo"
          required
          id="correo_electronico"
          placeholder="ejemplo@correo.com"
        />
      </div>
      <div className="content-input">
        <label htmlFor="contrasenia">Contraseña</label>
        <input
          type="password"
          name="password"
          required
          id="contrasenia"
          placeholder="Ingresa tu contraseña"
        />
      </div>

      {statusForm.error && (
        <span className="error-form">{statusForm.error}</span>
      )}

      {statusForm.success && (
        <span className="success-form">¡Inicio de sesión exitoso! Redirigiendo...</span>
      )}

      <div className="content-submit">
        <button type="submit" disabled={statusForm.isLoading}>
          {statusForm.isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </div>

      <div className="content-login-link">
        <span>¿No tienes una cuenta?</span>
        <a href="/crear-cuenta">Crear cuenta</a>
      </div>
    </form>
  );
}
