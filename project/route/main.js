const {dashboard,signup}=require("../controller/main");
const auth=require("../middleware/auth");

const express=require('express');
const router=express.Router();

router.route('/').post(auth,dashboard);
router.route('/dashboard').post(auth,dashboard);
router.route('/login').post(auth,dashboard);
//router.use("/login",auth,express.static("../public/dashboard"));
router.route('/signup').post(signup);

module.exports=router;