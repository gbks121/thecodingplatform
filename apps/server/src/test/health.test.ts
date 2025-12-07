import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Health Route', () => {
    it('should return 200 OK with status and uptime', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('uptime');
        expect(typeof response.body.uptime).toBe('number');
    });
});
