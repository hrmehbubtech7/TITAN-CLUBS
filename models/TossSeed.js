const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TossSeedSchema = new Schema({  
  user:{
    type: mongoose.ObjectId,
    required:true,
    index:true
  },
  seed:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = TossSeed = mongoose.model("tossSeed", TossSeedSchema);
