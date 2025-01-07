const express=require('express');
const cors=require('cors');
const app=express();
require('dotenv').config();
const mainroute=require("./route/main");
const connectDB = require('./db/connect');
const auth=require("./middleware/auth");
const session = require('express-session');
const uri=process.env.uri;

app.use(express.json());
app.use(express.urlencoded({extended:false}));

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
app.use("/api/v1/project/host/hostdashboard",express.static("./public/Hostapp/hostdashboard"));


app.use("/api/v1/project",mainroute);




// const upload = multer({ dest: "uploads/" });
// const deleteFile = (filePath) => {
//     fs.unlink(filePath, (err) => {
//       if (err) {
//         console.error('Error deleting file:', err);
//       } else {
//         console.log('File deleted successfully:', filePath);
//       }
//     });
//   };

// // Face++ API credentials
// const FACE_PLUS_PLUS_API_KEY = process.env.FACE_PLUS_PLUS_API_KEY;
// const FACE_PLUS_PLUS_API_SECRET = process.env.FACE_PLUS_PLUS_API_SECRET;

// // Route to handle ID and selfie uploads
// app.post("/verify-identity", upload.fields([{ name: "idDoc" }, { name: "selfie" }]), async (req, res) => {
//   const { idDoc, selfie } = req.files;

//   if (!idDoc || !selfie) {
//     return res.status(400).json({ message: "Both ID and selfie are required." });
//   }

//   let form = new FormData();
// form.append('api_key', FACE_PLUS_PLUS_API_KEY);
// form.append('api_secret', FACE_PLUS_PLUS_API_SECRET);
// form.append('image_file', fs.createReadStream(idDoc[0].path)); // Send file directly
// form.append('return_landmark', '1'); // Optional: return landmarks for face detection

// try {
//     const detectionResponse = await axios.post(
//       'https://api-us.faceplusplus.com/facepp/v3/detect',
//       form,
//       {
//         headers: {
//           ...form.getHeaders()
//         }
//       }
//     );
  
//     console.log(detectionResponse.data); // Handle API response here

//     const faces = detectionResponse.data.faces;
//         if (faces.length === 0) {
//           return res.status(400).json({ message: "No faces detected in the image." });
//         }
    
//         const faceToken = faces[0].face_token;

//         form = new FormData();
//         form.append('api_key', FACE_PLUS_PLUS_API_KEY);
//         form.append('api_secret', FACE_PLUS_PLUS_API_SECRET);
//         form.append('image_file1', fs.createReadStream(idDoc[0].path));
//         form.append('image_file2', fs.createReadStream(selfie[0].path));

//         const verificationResponse = await axios.post(
//             "https://api-us.faceplusplus.com/facepp/v3/compare",
//             form,
//             {
//               headers: {
//                 ...form.getHeaders()
//               }
//             }
//           );

//           const similarity = verificationResponse.data.confidence;
      
//           if (similarity > 80) {  // Confidence threshold, can be adjusted
//             return res.status(200).json({
//               message: "Identity verified successfully.",
//               confidence: similarity,
//             });
//           } else {
//             return res.status(400).json({
//               message: "Face match failed, similarity too low.",
//               confidence: similarity,
//             });
//           }

//   } catch (error) {
    
//     if (error.response && error.response.data.error_message === 'CONCURRENCY_LIMIT_EXCEEDED') {
//         console.log('Concurrency limit exceeded. Retrying...');
//         await delay(5000); // Wait 5 seconds before retrying
//         return await makeRequest(form); // Retry the request
//       } else {
//         console.error('Error uploading image:', error.response ? error.response.data : error.message);
//       }
//   } 
//   finally {
//     // Clean up the uploaded files after the process is done
//     deleteFile(idDoc[0].path); // Delete the ID document
//     deleteFile(selfie[0].path); // Delete the resized selfie image
//   }

// });







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