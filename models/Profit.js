const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DayBetSchema = new Schema({  
  period:{
    type: String,
  },
  raffle: {
    type:String,
    enum:["Hourly","Daily","Toss","Weekly","Color","Bonus"],
  },   
  amount:{
    type:Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = DayBet = mongoose.model("profit", DayBetSchema);
