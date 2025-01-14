const Host = require("../model/host");
const travelpackagemodel = require("../model/travelpackage");
const homestaymodel = require("../model/homestaypackage");
const bcrypt = require("bcrypt");
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');
const axios = require("axios");
const FormData = require('form-data');
const fs = require("fs");
require('dotenv').config();

registerHost = async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "chinmoysharma2003@gmail.com",
            pass: process.env.emailpassword,
        },
        });
  
  const { name, email, phone, password } = req.body;

  const errors = [];

  // Validate Name
  if (!name || name.length < 3) {
    errors.push({ field: "name", message: "Name must be at least 3 characters long." });
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "Invalid email address." });
  }

  // Validate Phone
  const phoneRegex = /^[0-9]{10}$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.push({ field: "phone", message: "Phone number must be 10 digits." });
  }

  // Validate Password
  if (!password || password.length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long." });
  }

  // Check for validation errors
  if (errors.length > 0) {
    return res.status(400).json({ location:"registerHost",errors });
  }

  try {
    // Check if email already exists
    const existingHost = await Host.findOne({ email });
    if (existingHost) {
      return res.status(400).json({
        location:"registerHost",
        errors: [{ field: "email", message: "Email is already in use." }],
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Host
    const newHost = new Host({ name, email, phone, password: hashedPassword });
    await newHost.save();

    const token = jwt.sign({ email }, process.env.jwt_secret, { expiresIn: "1h" });
    //const verificationUrl = `http://localhost:3000/api/v1/project/verify/${token}`;
    const verificationUrl = `https://trekathon-2025.onrender.com/api/v1/project/verify/${token}`;

    //send email for verification
    await transporter.sendMail({
      from: 'chinmoysharma2003@gmail.com',
      to: email,
      subject: "Verify your account",
      html: `<p>Go to the link to verify your account. <a href="${verificationUrl}">Verify</a></p>`,
    });

    res.status(201).json({ token,message: "Registration successful. Please verify your email." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ location:"registerHost",error:error,message: "Server error. Please try again later." });
  }
};

loginHost=async(req,res)=>{
  const { email, password } = req.body;

  const errors = [];

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "Invalid email address." });
  }

  // Validate Password
  if (!password || password.length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long." });
  }

  // Check for validation errors
  if (errors.length > 0) {
    return res.status(400).json({ location:"registerHost",errors });
  }

  const existingHost = await Host.findOne({ email });
    if (!existingHost) {
      return res.status(400).json({
        location:"registerHost",
        errors: [{ field: "email", message: "Please create an account first." }],
      });
    }

    const ispasswordmatch=await bcrypt.compare(password,existingHost.password);
    if(!ispasswordmatch)
    {
      errors.push({field:"password",message:"Incorrect password"});
      return res.status(401).json({errors});
    }

    const token = jwt.sign({ email }, process.env.jwt_secret, { expiresIn: "1h" });

    return res.status(200).json({token:token,message:"logged in successfully!"});


};

verifyEmail = async (req, res) => {
    const { token } = req.params;
  
    try {
      const decoded = jwt.verify(token, process.env.jwt_secret);
      const host = await Host.findOne({ email: decoded.email });
  
      if (!host) return res.status(404).json({ location:"verifyEmail",message: "Host not found" });
  
      host.isVerifiedEmail = true;
      await host.save();
  
      res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
      res.status(400).json({ location:"verifyEmail",message: "Invalid or expired token." });
    }
  };

verifyIdentity=async (req, res) => {
  const FACE_PLUS_PLUS_API_KEY = process.env.FACE_PLUS_PLUS_API_KEY;
  const FACE_PLUS_PLUS_API_SECRET = process.env.FACE_PLUS_PLUS_API_SECRET;

  const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully:', filePath);
      }
    });
  };

  const token = req.body.token;

  const { idDoc, selfie } = req.files;

  if (!token) {
    return res.status(400).json({location:"verifyIdentity", message: 'Token is missing.' });
  }

  if (!idDoc || !selfie) {
    return res.status(400).json({ location:"verifyIdentity",message: "Both ID and selfie are required." });
  }

  let form = new FormData();
  form.append('api_key', FACE_PLUS_PLUS_API_KEY);
  form.append('api_secret', FACE_PLUS_PLUS_API_SECRET);
  form.append('image_file', fs.createReadStream(idDoc[0].path)); // Send file directly
  form.append('return_landmark', '1'); // Optional: return landmarks for face detection

  try {
      const detectionResponse = await axios.post(
        'https://api-us.faceplusplus.com/facepp/v3/detect',
        form,
        {
          headers: {
            ...form.getHeaders()
          }
        }
      );
    
      console.log("detected response:"+detectionResponse.data); // Handle API response here

      const faces = detectionResponse.data.faces;
          if (faces.length === 0) {
            return res.status(400).json({ location:"verifyIdentity",message: "No faces detected in the image." });
          }
      
          const faceToken = faces[0].face_token;

          form = new FormData();
          form.append('api_key', FACE_PLUS_PLUS_API_KEY);
          form.append('api_secret', FACE_PLUS_PLUS_API_SECRET);
          form.append('image_file1', fs.createReadStream(idDoc[0].path));
          form.append('image_file2', fs.createReadStream(selfie[0].path));

          const verificationResponse = await axios.post(
              "https://api-us.faceplusplus.com/facepp/v3/compare",
              form,
              {
                headers: {
                  ...form.getHeaders()
                }
              }
            );

            const similarity = verificationResponse.data.confidence;

            //search database
            
            const decoded = jwt.verify(token, process.env.jwt_secret);
            const host = await Host.findOne({ email: decoded.email });
        
            if (!host) return res.status(404).json({ location:"verifyIdentity",message: "Host not found" });

        
            if (similarity > 80) {                // Confidence threshold, can be adjusted
              //update database
              host.isVerifiedDocument = true;
              await host.save();                                    
              return res.status(200).json({
                message: "Identity verified successfully.",
                confidence: similarity,
              });
            } else {
              return res.status(200).json({
                message: "Face match failed, similarity too low.",
                confidence: similarity,
              });
            }

    } catch (error) {
      res.status(500).json({location:"verifyIdentity",'Error uploading image:': error.response ? error.response.data : error.message});
    } 
    finally {
      // Clean up the uploaded files after the process is done
      deleteFile(idDoc[0].path); // Delete the ID document
      deleteFile(selfie[0].path); // Delete the resized selfie image
    }

};

hostdashboard=async(req,res)=>{
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const token = req.cookies['token'];

  try{
    const decoded = jwt.verify(token, process.env.jwt_secret);
    const host = await Host.findOne({ email: decoded.email });

    if (!host) return res.status(404).json({ location:"hostdashboard",message: "Host not found" });

    return res.status(200).json({token, message: `Welcome ${host.name}`, email:host.email });
  }
  catch(error)
  {
    return res.status(400).json({message:"Access denied!"});
  }
        
};

searchpackage=async(req,res)=>{
  const {name}=req.body;
  try{
    const data=await travelpackagemodel.find({title : {$regex : name,$options:'i'}});
    if(data.length===0)
    {
        return res.status(404).json({message:"No packages found!"});
    }
    res.status(200).json(data);
  }
  catch(error)
  {
    res.status(500).json({message:"Error occured in catch block of searchpackage controller"});
  }
  
};

searchhomestay=async(req,res)=>{
  const {name}=req.body;
  try{
    const data=await homestaymodel.find({title : {$regex : name,$options:'i'}});
    if(data.length===0)
    {
        return res.status(404).json({message:"No homestays found!"});
    }
    res.status(200).json(data);
  }
  catch(error)
  {
    res.status(500).json({message:"Error occured in catch block of searchhomestay controller"});
  }
  
};


module.exports={registerHost,loginHost,verifyEmail,verifyIdentity,hostdashboard,searchpackage,searchhomestay};

  
