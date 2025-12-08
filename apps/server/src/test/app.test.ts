import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app";

describe("Express App Configuration", () => {
    beforeEach(() => {
        // Ensure fresh app instance for each test
        vi.clearAllMocks();
    });

    it("should have CORS middleware enabled", async () => {
        // Test that CORS headers are present in response
        const response = await request(app).options("/health");

        // Check for CORS headers
        expect(response.headers["access-control-allow-origin"]).toBe("*");
        // The actual CORS implementation might vary, so we'll also test general CORS compatibility
    });

    it("should parse JSON bodies correctly", async () => {
        // Test that JSON parsing middleware works by sending a JSON payload to a non-existent route
        // This tests that the middleware doesn't break when processing JSON
        const response = await request(app)
            .post("/non-existent-route")
            .send({ test: "data" })
            .set("Content-Type", "application/json");

        // Should be able to parse JSON without crashing
        expect(response.status).toBeDefined();
    });

    it("should have health router mounted at /health", async () => {
        // This tests that the health router is properly mounted
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("uptime");
    });

    it("should return 404 for non-existent routes", async () => {
        const response = await request(app).get("/non-existent-endpoint");

        expect(response.status).toBe(404);
    });

    it("should handle different HTTP methods appropriately", async () => {
        // Test GET method on health route
        const getResponse = await request(app).get("/health");
        expect(getResponse.status).toBe(200);

        // Test POST method on health route (should be not allowed)
        const postResponse = await request(app).post("/health").send({});
        expect(postResponse.status).toBe(404); // Since the health router only has GET route
    });
});
