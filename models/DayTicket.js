const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DayTicketSchema = new Schema({  
  no:{
    type: Number,
  },
  ticket: {
    type: Number,
    required: true
  }, 
  place:{
    type: Number
  },
  prize:{
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = DayTicket = mongoose.model("dayTicket", DayTicketSchema);
