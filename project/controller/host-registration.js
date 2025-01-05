const Host = require("../model/host");
const bcrypt = require("bcrypt");
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');
require('dotenv').config();

Host.find({}).then((data)=>console.log(data));

registerHost = async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "chinmoysharma2003@gmail.com",
            pass: 'zmsr xvov oajl wlkn',
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
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists
    const existingHost = await Host.findOne({ email });
    if (existingHost) {
      return res.status(400).json({
        errors: [{ field: "email", message: "Email is already in use." }],
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Host
    const newHost = new Host({ name, email, phone, password: hashedPassword });
    await newHost.save();

    const token = jwt.sign({ email }, process.env.jwt_secret, { expiresIn: "1h" });
    const verificationUrl = `http://localhost:3000/api/v1/project/verify/${token}`;

    //send email for verification
    await transporter.sendMail({
      from: 'chinmoysharma2003@gmail.com',
      to: email,
      subject: "Verify your account",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your account.</p>`,
    });

    res.status(201).json({ message: "Registration successful. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error:error,message: "Server error. Please try again later." });
  }
};

verifyEmail = async (req, res) => {
    const { token } = req.params;
  
    try {
      const decoded = jwt.verify(token, process.env.jwt_secret);
      const host = await Host.findOne({ email: decoded.email });
  
      if (!host) return res.status(404).json({ message: "Host not found" });
  
      host.isVerified = true;
      await host.save();
  
      res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
      res.status(400).json({ message: "Invalid or expired token." });
    }
  };

module.exports={registerHost,verifyEmail};

  
