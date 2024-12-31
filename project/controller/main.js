const bcrypt=require("bcrypt");
const model= require("../model/model");
const path=require("path");
const dashboard=(req,res)=>{
    //res.status(200).json({"success":true,"msg":"This is the dashboard"});
    try{
        const filePath = path.join(__dirname, '..', 'public', 'dashboard', 'index.html');
        // Send the file
        return res.status(200).sendFile(filePath);
    }
    catch(error){
        console.log(error);
    }
};

const signup=async(req,res)=>{
    try{
        const saltrounds=10;
        const hashedpassword=await bcrypt.hash(req.body.password,saltrounds);

        req.body.password=hashedpassword;
        const userdata=await model.create({"username":req.body.username,"password":req.body.password});

        console.log(userdata);
        res.redirect("/api/v1/project/login");
    }
    catch(error)
    {
        console.log(error);
    }
};

module.exports={dashboard,signup};