/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the customer feedback API
 */

// Require the modules
const request = require("supertest");
const app = require("../../../../src/app");
const { mongo } = require("../../../../src/utils/mongo");

jest.mock("../../../../src/utils/mongo");

// Test the customer feedback API
describe("Apre Customer Feedback API", () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the channel-rating-by-month endpoint
  it("should fetch average customer feedback ratings by channel for a specified month", async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              channels: ["Email", "Phone"],
              ratingAvg: [4.5, 3.8],
            },
          ]),
        }),
      };
      await callback(db);
    });

    const response = await request(app).get(
      "/api/reports/customer-feedback/channel-rating-by-month?month=1"
    ); // Send a GET request to the channel-rating-by-month endpoint

    // Expect a 200 status code
    expect(response.status).toBe(200);

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        channels: ["Email", "Phone"],
        ratingAvg: [4.5, 3.8],
      },
    ]);
  });

  // Test the channel-rating-by-month endpoint with missing parameters
  it("should return 400 if the month parameter is missing", async () => {
    const response = await request(app).get(
      "/api/reports/customer-feedback/channel-rating-by-month"
    ); // Send a GET request to the channel-rating-by-month endpoint with missing month
    expect(response.status).toBe(400); // Expect a 400 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: "month and channel are required",
      status: 400,
      type: "error",
    });
  });

  // Test the channel-rating-by-month endpoint with an invalid month
  it("should return 404 for an invalid endpoint", async () => {
    // Send a GET request to an invalid endpoint
    const response = await request(app).get(
      "/api/reports/customer-feedback/invalid-endpoint"
    );
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: "Not Found",
      status: 404,
      type: "error",
    });
  });

  describe("GET /channel-rating-by-month/:month", () => {
    it("should fetch average ratings by channel for a specified month via path param", async () => {
      mongo.mockImplementation(async (callback) => {
        const db = {
          collection: jest.fn().mockReturnThis(),
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              {
                channels: ["Email", "Phone"],
                ratingAvg: [4.5, 3.8],
              },
            ]),
          }),
        };
        await callback(db);
      });

      const response = await request(app).get(
        "/api/reports/customer-feedback/channel-rating-by-month/2"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          channels: ["Email", "Phone"],
          ratingAvg: [4.5, 3.8],
        },
      ]);
    });

    it("should return an empty array for a non-numeric month path param", async () => {
      mongo.mockImplementation(async (callback) => {
        const db = {
          collection: jest.fn().mockReturnThis(),
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        };
        await callback(db);
      });

      const response = await request(app).get(
        "/api/reports/customer-feedback/channel-rating-by-month/abc"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /channel-rating-by-year/:year", () => {
    // Test the channel-rating-by-year endpoint
    it("should fetch average customer feedback ratings by channel for a specified year", async () => {
      mongo.mockImplementation(async (callback) => {
        const db = {
          collection: jest.fn().mockReturnThis(),
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              { channel: "Email", ratingAvg: 4.5 },
              { channel: "Phone", ratingAvg: 3.8 },
            ]),
          }),
        };
        await callback(db);
      });

      const response = await request(app).get(
        "/api/reports/customer-feedback/channel-rating-by-year/1"
      ); // Send a GET request to the channel-rating-by-year endpoint
      // Expect a 200 status code
      expect(response.status).toBe(200);

      // Expect the response body to match the expected data
      expect(response.body).toEqual([
        {
          channel: "Email",
          ratingAvg: 4.5,
        },
        {
          channel: "Phone",
          ratingAvg: 3.8,
        },
      ]);
    });

    // Test the channel-rating-by-year endpoint with missing parameters
    it("should return 400 if the year parameter is missing", async () => {
      const response = await request(app).get(
        "/api/reports/customer-feedback/channel-rating-by-year/pie"
      ); // Send a GET request to the channel-rating-by-year endpoint with missing year
      expect(response.status).toBe(400); // Expect a 400 status code

      // Expect the response body to match the expected data
      expect(response.body).toEqual({
        message: "year must be an integer",
        status: 400,
        type: "error",
      });
    });

    // Test the channel-rating-by-year endpoint with an invalid year
    it("should return 404 for an invalid endpoint", async () => {
      // Send a GET request to an invalid endpoint
      const response = await request(app).get(
        "/api/reports/customer-feedback/invalid-endpoint"
      );
      expect(response.status).toBe(404); // Expect a 404 status code

      // Expect the response body to match the expected data
      expect(response.body).toEqual({
        message: "Not Found",
        status: 404,
        type: "error",
      });
    });
  });
});
