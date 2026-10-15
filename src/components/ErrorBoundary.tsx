import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { THEME } from "@/constants/theme";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center p-8 text-center h-full w-full bg-white"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: THEME.colors.criticalBg }}
          >
            <AlertCircle style={{ color: THEME.colors.criticalRed, width: 24, height: 24 }} />
          </div>
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: THEME.colors.ink, fontFamily: THEME.typography.fontFamily }}
          >
            {this.props.fallbackTitle || "Chart Rendering Error"}
          </h2>
          <p
            className="text-sm max-w-md mb-6"
            style={{ color: THEME.colors.inkMuted, fontFamily: THEME.typography.fontFamily }}
          >
            {this.state.error?.message ||
              "An unexpected error occurred while calculating or rendering the PERT chart."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: THEME.colors.ink,
              color: THEME.colors.canvas,
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Chart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
