const mongoose = require("mongoose");
const card = require("./model/homestaypackage");
require("dotenv").config();

// Connect to the database
mongoose.connect(process.env.uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected");

        // Access the native MongoDB collection
        //return mongoose.connection.db.command({ compact: "Homestaypackage" });
        mongoose.connection.db.collection("Homestaypackage").reIndex((err, result) => {
            if (err) {
                console.error("Error rebuilding indexes:", err);
            } else {
                console.log("Indexes rebuilt:", result);
            }
        });
        
    })
    .then((result) => {
        console.log("Compact operation result:", result);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
