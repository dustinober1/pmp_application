import { createClient, RedisClientType } from 'redis';

class CacheService {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });

        this.client.on('error', (err) => {
            console.error('[CACHE] Redis Error:', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            console.log('[CACHE] Redis connected');
            this.isConnected = true;
        });

        this.connect();
    }

    private async connect() {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
        } catch (error) {
            console.error('[CACHE] Failed to connect:', error);
        }
    }

    public async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`[CACHE] GET error for key ${key}:`, error);
            return null;
        }
    }

    public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
        } catch (error) {
            console.error(`[CACHE] SET error for key ${key}:`, error);
        }
    }

    public async del(key: string): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.client.del(key);
        } catch (error) {
            console.error(`[CACHE] DEL error for key ${key}:`, error);
        }
    }
}

export const cache = new CacheService();
