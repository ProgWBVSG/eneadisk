import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Captura cualquier error de render en el árbol de React y muestra una
 * pantalla de error legible en vez de una pantalla en blanco ("White
 * Screen of Death"). Sin esto, un crash en cualquier componente deja
 * al usuario viendo una página totalmente vacía sin pista de qué pasó.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log para debugging (visible en la consola del navegador)
    console.error('[ErrorBoundary] Render crash:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    // Recarga forzando una navegación nueva (evita quedar con una versión
    // vieja cacheada del bundle, causa típica de "Algo salió mal" tras un deploy).
    try {
      if ('caches' in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
    } catch { /* noop */ }
    const base = window.location.origin + window.location.pathname;
    window.location.replace(`${base}?_r=${Date.now()}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h1>
            <p className="text-slate-500 text-sm mb-6">
              Encontramos un problema al cargar esta página. Podés recargar o volver al inicio.
            </p>

            {/* Detalle técnico colapsable */}
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                  Ver detalle técnico
                </summary>
                <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-red-600 overflow-auto max-h-32 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Recargar página
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 text-slate-500 text-sm hover:text-slate-700 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
