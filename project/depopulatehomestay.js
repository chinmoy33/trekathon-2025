const mongoose=require("mongoose");
const card=require("./model/homestaypackage");
require("dotenv").config();
mongoose.connect(process.env.uri).then((response)=>{
    console.log("connected");
});

card.deleteMany({}).then((response)=>{
    console.log("deleted");
});