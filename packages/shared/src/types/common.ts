/**
 * Common utility types used across the application
 */

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ErrorResponse;
}

export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    suggestion?: string;
}
