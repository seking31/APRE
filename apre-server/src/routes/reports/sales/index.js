/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

"use strict";

const express = require("express");
const { mongo } = require("../../../utils/mongo");

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/regions", (req, res, next) => {
  try {
    mongo(async (db) => {
      const regions = await db.collection("sales").distinct("region");
      res.send(regions);
    }, next);
  } catch (err) {
    console.error("Error getting regions: ", err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/regions/:region", (req, res, next) => {
  try {
    mongo(async (db) => {
      const salesReportByRegion = await db
        .collection("sales")
        .aggregate([
          { $match: { region: req.params.region } },
          {
            $group: {
              _id: "$salesperson",
              totalSales: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 0,
              salesperson: "$_id",
              totalSales: 1,
            },
          },
          {
            $sort: { salesperson: 1 },
          },
        ])
        .toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error("Error getting sales data for region: ", err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /sales-by-product/:product
 *
 * Fetches sales data for a specific product, grouped by salesperson.
 *
 * Example:
 * fetch('/sales-by-product/Widget-123')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get("/sales-by-product/:product", (req, res, next) => {
  try {
    mongo(async (db) => {
      const salesReportByProduct = await db
        .collection("sales")
        .aggregate([
          { $match: { product: req.params.product } },
          {
            $group: {
              _id: "$salesperson",
              totalSales: { $sum: "$amount" },
              product: { $first: "$product" },
            },
          },
          {
            $project: {
              _id: 0,
              salesperson: "$_id",
              totalSales: 1,
              product: 1,
            },
          },
          { $sort: { salesperson: 1 } },
        ])
        .toArray();

      res.status(200).send(salesReportByProduct);
    }, next);
  } catch (err) {
    console.error("Error getting sales data for product:", err);
    next(err);
  }
});

module.exports = router;
