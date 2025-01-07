const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const uploadnone = multer();
//app.use(upload.none());


module.exports={upload,uploadnone};