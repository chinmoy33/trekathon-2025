import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';
const welcomediv=document.getElementById("welcomediv");

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token'); // Retrieve the token from the URL

async function getdashboard(){

    const formData = new FormData();
    formData.append("token", token); // Add the token to the form data
    
    try{
        const {data}=await axios.post("http://127.0.0.1:3000/api/v1/project/host/hostdashboard",formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        welcomediv.textContent=`${data.message}`;
    }
    catch(error){
        welcomediv.textContent=`${error.response.data.message}`;
    }
};

getdashboard();