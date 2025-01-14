const mongoose = require("mongoose");

// Define the Card schema
const homestaypackageSchema = new mongoose.Schema({
  id: {type: Number, required: true},  
  title: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String, required: true }, // URL or base64 string
  duration: {type: Number, required:true},
  price: {type: Number, required:true},
  email: {type: String, required:true}
});

// Create a Card model
const cardhomestay = mongoose.model("Homestaypackage", homestaypackageSchema);

module.exports = cardhomestay;