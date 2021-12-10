const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DayBetSchema = new Schema({    
  userid:{
    type: mongoose.ObjectId,
    ref:'user',
    required:true,
    index:true
  },
  content:{
    type:String   
  },  
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = DayBet = mongoose.model("review", DayBetSchema);
