import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token'); // Retrieve the token from the URL

document.getElementById('uploadForm').addEventListener('submit',async function(event) {
    event.preventDefault();

    const idFile = document.getElementById('idFile').files[0];
    const selfieFile = document.getElementById('selfieFile').files[0];
    const messageDiv = document.getElementById('message');

    // Clear previous messages
    messageDiv.textContent = '';

    // Validate files
    const files = [idFile, selfieFile];
    const fileNames = ['Government ID', 'Selfie'];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = fileNames[i];

        if (file.size > 10 * 1024 * 1024) { // 10MB
            messageDiv.textContent += `${fileName} size must be less than 10MB.`;
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async function() {
            const width = img.width;
            const height = img.height;

            if (width < 40 || width > 4096 || height < 40 || height > 4096) {
                messageDiv.textContent += `${fileName} dimensions must be between 40x40 and 4096x4096 pixels.`;
                return;
            }

            // If both files are valid, you can proceed with the upload
            if (file === selfieFile) {
                //messageDiv.textContent = 'Both files are valid! You can proceed with the upload.';
                // Here you can add your upload logic
                const formData = new FormData();
            formData.append("idDoc", idFile);
            formData.append("selfie", selfieFile);
            formData.append("token", token); // Add the token to the form data

            try {
                const response = await axios.post(`http://127.0.0.1:3000/api/v1/project/host/verify-identity`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log(response.data); // Handle success response here
                messageDiv.textContent=`Result:${response.data.message},Confidence:${response.data.confidence}`;
                setTimeout(() => {
                    alert("You will be redirected to the login page");
                }, 100); 
        
                setTimeout(() => {
                    window.location.href = `http://127.0.0.1:3000/api/v1/project/host/login`;
                }, 100); 

            } catch (error) {
                console.error("Error uploading documents:", error.response);
                messageDiv.textContent=error.response.data.message;
            }
            }
        };
    }
});