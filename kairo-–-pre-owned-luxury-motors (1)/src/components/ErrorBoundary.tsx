import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('KAIRO ErrorBoundary:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#111111] border border-[#303030] p-8 text-center">
            <span className="font-nav text-xs tracking-[0.2em] uppercase text-[#C6A76B]">
              KAIRO Concierge Notice
            </span>
            <h1 className="font-display text-3xl text-white mt-2">
              Unable to Render This View
            </h1>
            <p className="text-sm text-[#A5A5A5] mt-3 leading-relaxed">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="mt-6 px-7 py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
            >
              Return to KAIRO Showroom
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
