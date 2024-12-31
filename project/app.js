const express=require('express');
const app=express();
require('dotenv').config();
const mainroute=require("./route/main");
const connectDB = require('./db/connect');
const auth=require("./middleware/auth");
const uri=process.env.uri;

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use("/api/v1/project/dashboard",auth,express.static("./public/dashboard"));
app.use("/api/v1/project/login",express.static("./public/login"));
app.use("/api/v1/project/signup",express.static("./public/signup"));
app.use("/",express.static("./public/login"));

app.use("/api/v1/project",mainroute);

const port = process.env.PORT || 3000;
async function start(){
    try {
        await connectDB(uri);
        app.listen(port,()=>{
            console.log(`server is running on ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
};
start();