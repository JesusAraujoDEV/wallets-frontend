import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Without this, an uncaught render error anywhere in the tree leaves the
// SPA frozen on its last-committed screen with no feedback — the "nothing
// loads, only F5 works" symptom. Catch it and offer a reload instead.
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">Algo salió mal.</p>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error inesperado. Recarga la página para continuar.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Recargar
        </button>
      </div>
    );
  }
}
