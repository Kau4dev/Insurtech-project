export interface ErrorResponse {
    status: number;
    message: string;
    path: string;
    errors?: Record<string, string> | null;
    timestamp: string;
}