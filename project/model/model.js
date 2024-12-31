const mongoose = require('mongoose');

const schema=mongoose.Schema({
    username:{
        type:String,
        required:[true,"Please provide a name"]
    },
    password:{
        type:String,
        required:[true,"Please provide a password"]
    }
});

const model=mongoose.model("User Credentials",schema);

module.exports=model;