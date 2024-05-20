const express = require("express");
const {
  addTicket,
  getTickets,
  closedTicket,
} = require("../controllers/TicketController");
const router = express.Router();

router.route("/addticket").post(addTicket);
router.route("/get-tickets").get(getTickets);
router.route("/ticket-closed").post(closedTicket);
module.exports = router;
