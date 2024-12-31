

const model=require("../model/model");
const bcrypt=require('bcrypt');
const auth=async(req,res,next)=>{
    const {username,password}=req.body;
    try {
        const user=await model.findOne({username:username});
        if(!user)
        {
            // req.session.redirectData = { "msg": "user does not exist"};
            // return res.redirect('/api/v1/project/login');
            //return res.status(401).json({"msg":"user does not exist"});
            return res.redirect("/api/v1/project/login");
        }
        const ispasswordmatch=await bcrypt.compare(password,user.password);
        if(ispasswordmatch)
        {
            next();
        }
        else{
            return res.status(401).json({"msg":"Unauthorized"});
            //res.redirect("/api/v1/project/login");
        }

    } catch (error) {
        //console.log(error);
        next(error);
    }
};

module.exports=auth;