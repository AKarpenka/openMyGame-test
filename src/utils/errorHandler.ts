class ErrorHandler {
  handleSaveError(error: Error | unknown, context?: Record<string, unknown>): void {
    const message = this.extractMessage(error);

    console.error('[SAVE ERROR]', message, context || {});
  }

  handleLoadError(error: Error | unknown, context?: Record<string, unknown>): void {
    const message = this.extractMessage(error);

    console.error('[LOAD ERROR]', message, context || {});
  }

  private extractMessage(error: Error | unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return 'Произошла неизвестная ошибка';
  }
}

export const errorHandler = new ErrorHandler();

