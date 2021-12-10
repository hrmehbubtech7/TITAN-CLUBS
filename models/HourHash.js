const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const HourHashSchema = new Schema({  
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

module.exports = HourHash = mongoose.model("hourhash", HourHashSchema);
