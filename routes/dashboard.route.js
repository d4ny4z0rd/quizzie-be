const express = require("express");
const router = express.Router();
const { getDashboardMetrics } = require("../controllers/dashboard.controller");
const verifyJWT = require("../middleware/auth.middleware");

router.get("/", verifyJWT, getDashboardMetrics);

module.exports = router;
