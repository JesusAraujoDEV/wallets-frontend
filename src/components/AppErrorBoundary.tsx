import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  // Changes whenever the route changes; a new value clears a caught error so
  // navigating away from a broken page recovers without a full reload.
  resetKey: string;
}

interface State {
  hasError: boolean;
  resetKey: string;
}

// Without this, an uncaught render error anywhere in the tree leaves the SPA
// frozen on its last-committed screen with no feedback. This boundary catches
// the error AND resets itself on navigation (resetKey change), so clicking
// another sidebar link recovers the app instead of staying stuck until reload.
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey === state.resetKey) return null;
    return { hasError: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">Algo salió mal.</p>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error inesperado. Intenta de nuevo o recarga la página.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
