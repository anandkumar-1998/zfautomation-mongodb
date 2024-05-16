const express = require("express");
const {
    getLiveDate
} = require("../controllers/systemController");

const router = express.Router();
router.route("/getLiveDate").get(getLiveDate);

module.exports = router;