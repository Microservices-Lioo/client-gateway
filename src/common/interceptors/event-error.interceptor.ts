import { Injectable } from "@nestjs/common";

@Injectable()
export class EventErrorInterceptor {
    
    handleEventError(error: any, eventName: string, data?: any): void {
        console.error(`Unhandled error in event ${eventName}:`, {
            error: error.message || error,
            stack: error.stack,
            data,
            timestamp: new Date().toISOString()
        });
    }
    
    // Método para reintentos si es necesario
    async handleWithRetry<T>(
        operation: () => Promise<T>,
        eventName: string,
        data?: any,
        maxRetries: number = 3
    ): Promise<T | null> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    this.handleEventError(error, eventName, data);
                    return null;
                }
                
                console.warn(`Event ${eventName} failed (attempt ${attempt}/${maxRetries}), retrying...`);
                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        return null;
    }
}