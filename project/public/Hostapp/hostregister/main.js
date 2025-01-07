//import axios from 'axios';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';
const errordiv=document.querySelectorAll(".error");

function showLoader() {
    document.getElementById('loading').style.display = 'flex';
  }
  
  function hideLoader() {
    document.getElementById('loading').style.display = 'none';
  }

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('registrationForm').reset();
    errordiv.forEach((div)=>{
        div.textContent="";
    });
  });

  document.getElementById('registrationForm').addEventListener('submit',async(event) => {
    event.preventDefault();

    errordiv.forEach((div)=>{
        div.textContent="";
    });
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try{
        showLoader();
        const {data}=await axios.post("http://127.0.0.1:3000/api/v1/project/host/register",{name,email,phone,password});
        //const {data}=await axios.post("https://trekathon-2025.onrender.com/api/v1/project/host/register",{name,email,phone,password});
        hideLoader();
        setTimeout(() => {
            alert(data.message);
        }, 100); 

        setTimeout(() => {
            window.location.href = `http://127.0.0.1:3000/api/v1/project/host/verify-identity?token=${data.token}`;
        }, 100); 
        
    }
    catch(error)
    {
        hideLoader();
        if(error.response)
        {
            if(error.response.data.location==="registerHost")
            {
                error.response.data.errors.forEach((item) => {
                    if(item.field==="name")
                    {
                        errordiv[0].textContent=`${item.message}`;
                    }
                    if(item.field==="email")
                    {
                        errordiv[1].textContent=`${item.message}`;
                    }
                    if(item.field==="phone")
                    {
                        errordiv[2].textContent=`${item.message}`;
                    }
                    if(item.field==="password")
                    {
                        errordiv[3].textContent=`${item.message}`;
                    }
                });
            }

            
        }
    }
  });