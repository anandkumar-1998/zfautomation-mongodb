const connectDatabase = require("../config/database");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Ticket = require("../models/ticketModel");

const { getClient } = require("../config/database");

exports.addTicket = catchAsyncErrors(async (req, res, next) => {
  const { issue, impact, priority } = req.body;

  let client = getClient();
  const session = client.startSession();
  session.startTransaction();

  await Ticket.create({
    issue,
    impact,
    priority,
    session: session,
  });
  console.log("Add the Ticket");
  await session.commitTransaction();
  session.endSession();
  res.status(200).json({
    success: true,
    message: "added the Ticket Sucessfully",
  });
});

exports.getTickets = catchAsyncErrors(async (req, res, next) => {
  let ticket = await Ticket.find({status: "OPEN"});
  console.log("get ticket");
  res.status(200).json({
    data: ticket,
    success: true,
    message: "get the tickets",
  });
});

exports.closedTicket = catchAsyncErrors(async (req, res, next) => {
  let { id } = req.query;
  let client = getClient();
  console.log('ticket closed ', id)
  const session = client.startSession();
  session.startTransaction();
  let ticket = await Ticket.findOne({ _id: id, session: session });
  console.log(ticket)
  if (ticket.status == "open" || ticket.status == "OPEN") {
    ticket.status = "closed";
    ticket.save();
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      message: "ticket is closed",
    });
  } else {
    session.abortTransaction();
    session.endSession()
    res
      .status(200)
      .json({ success: false, message: "ticket is already been closed" });
  }
});
