const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    issue: {
        type: String,
        required: [true, "Please Enter the Issue"],
        minLength: [10, "Issue should have at least more than 4 character"],
    },
    impact: {
        type: String,
        required: [true, "Please Enter the Impact"],
    },
    priority: {
        type: String,
        required: [true, "Please Enter the Impact"],
    },
    status: {
        type: String,
        default:"OPEN",
        required: [true, "Please Enter the Impact"],
    },
})


module.exports = mongoose.model("Ticket", ticketSchema)