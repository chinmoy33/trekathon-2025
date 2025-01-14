const express=require('express');
const cors=require('cors');
const app=express();
require('dotenv').config();
const mainroute=require("./route/main");
const connectDB = require('./db/connect');
const auth=require("./middleware/auth");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const Card = require("./model/travelpackage");
const Cardhomestay= require("./model/homestaypackage");
const uri=process.env.uri;
const rawBody = require('raw-body');




app.use(cookieParser());

// app.use(express.json());
// app.use(express.urlencoded({extended:false}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.use(session({
    secret: process.env.session_secret_key, // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false, // Set to false to comply with laws that require permission before setting cookies
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use("/api/v1/project/dashboard",auth,express.static("./public/dashboard"));
app.use("/api/v1/project/login",express.static("./public/login"));
app.use("/api/v1/project/signup",express.static("./public/signup"));
app.use("/",express.static("./public/login"));
app.use("/api/v1/project/host/register",express.static("./public/Hostapp/hostregister"));
app.use("/api/v1/project/host/verify-identity",express.static("./public/Hostapp/documentupload"));
app.use("/api/v1/project/host/login",express.static("./public/Hostapp/hostlogin"));
app.use("/api/v1/project/host/hostdashboard",express.static("./public/Hostapp/dashboardtesting"));



app.use("/api/v1/project",mainroute);

app.post("/api/cards", async (req, res) => {
    try {
      const card = new Card(req.body);
      const savedCard = await card.save();
      res.status(201).json(savedCard);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

app.patch("/api/cards/:id", async(req, res)=>{
    try{
      const cardId = req.params.id; // Extract card ID from URL
      const updates = req.body;    // Extract updates from the request body
      // Find the card by ID
      const card=await Card.findOneAndUpdate({id:Number(cardId)},updates,{new:true,runValidators:true});

      if (!card) {
          return res.status(404).json({ error: 'Card not found' });
      }

      res.status(200).json({ message: 'Package updated successfully', card });
    }
    catch(err){
      res.status(400).json({error: err.message});
    }
});

app.patch("/api/cardshomestay/:id", async(req, res)=>{
  try{
    const cardId = req.params.id; // Extract card ID from URL
    const updates = req.body;    // Extract updates from the request body
    // Find the card by ID
    const card=await Cardhomestay.findOneAndUpdate({id:Number(cardId)},updates,{new:true,runValidators:true});

    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }

    res.status(200).json({ message: 'Homestay updated successfully', card });
  }
  catch(err){
    res.status(400).json({error: err.message});
  }
});

app.delete("/api/cards/:id", async(req,res)=>{
    try{
      const cardId=req.params.id;

      const card=await Card.findOneAndDelete({id:Number(cardId)});
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.status(200).json({ message: 'Package deleted successfully', card });
    }
    catch(err){
      res.status(400).json({error: err.message});
    }
});

app.delete("/api/cardshomestay/:id", async(req,res)=>{
  try{
    const cardId=req.params.id;

    const card=await Cardhomestay.findOneAndDelete({id:Number(cardId)});
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.status(200).json({ message: 'Homestay deleted successfully', card });
  }
  catch(err){
    res.status(400).json({error: err.message});
  }
});

app.post("/api/cardshomestay", async (req, res) => {
try {
    const card = new Cardhomestay(req.body);
    const savedCard = await card.save();
    res.status(201).json(savedCard);
} catch (err) {
    res.status(400).json({ error: err.message });
}
});
  
  // Get all cards
  app.get("/api/cards", async (req, res) => {
    try {
      const cards = await Card.find();
      res.status(200).json({cards,nbhits:cards.length});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/cardshomestay", async (req, res) => {
    try {
      const cards = await Cardhomestay.find();
      res.status(200).json({cards,nbhits:cards.length});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  


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