const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DayHashSchema = new Schema({  
  hash: {
    type: String,
    required: true,
  },
  nonce:{
    type:Number
  },
  used:{
    type:Boolean,
    default:false
  }
});

module.exports = Dayhash = mongoose.model("dayhash", DayHashSchema);
