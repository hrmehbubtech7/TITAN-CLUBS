const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DayResultSchema = new Schema({  
  no:{
    type: Number,
  },
  place:{
    type: Number,
  },
  ticket: {
    type: Number,
    required: true
  },  
  userid:{
    type: mongoose.ObjectId,
    ref:'user',
    index:true
  }, 
  prize:{
    type: Number
  }, 
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = DayResult = mongoose.model("dayResult", DayResultSchema);
