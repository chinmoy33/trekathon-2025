const {dashboard,signup,adminlogin}=require("../controller/main");
const {registerHost,verifyEmail}=require('../controller/host-registration');
const auth=require("../middleware/auth");
const path=require('path');

const express=require('express');
const router=express.Router();

router.route('/').post(auth,dashboard);
router.route('/dashboard').post(auth,dashboard);
router.route('/login').post(auth,dashboard);
//router.use("/login",auth,express.static("../public/dashboard"));
router.route('/signup').post(signup);

const { adminauth } = require('../middleware/adminauth');

router.use('/admin/login',express.static(path.join(__dirname, '../public/adminlogin')));

router.use('/admin/signup',express.static(path.join(__dirname, '../public/adminsignup')));

// Handle admin login logic
router.post('/admin/login', adminlogin);

// Protect the admin dashboard route
router.use('/admin/dashboard', adminauth, express.static(path.join(__dirname, '../public/admindashboard/index.html')));


//host app routes
router.post("/host/register", registerHost);

router.get("/verify/:token", verifyEmail);

module.exports=router;