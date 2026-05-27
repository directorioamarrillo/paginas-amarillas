import React, { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((message, title = "Confirmar acción", confirmText = "Aceptar", cancelText = "Cancelar") => {
    setOptions({ message, title, confirmText, cancelText });
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up relative border border-slate-200">
            <div className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex shrink-0 h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-700 shadow-inner border border-primary-200">
                  <span className="text-4xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{options.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">{options.message}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-sm active:scale-95"
              >
                {options.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 text-sm font-bold text-[#1F1F1F] bg-primary rounded-xl hover:bg-primary-hover transition shadow-sm active:scale-95"
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  }
  return context.confirm;
};
