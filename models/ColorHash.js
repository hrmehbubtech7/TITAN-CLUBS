const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ColorHashSchema = new Schema({  
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

module.exports = Colorhash = mongoose.model("colorhash", ColorHashSchema);
