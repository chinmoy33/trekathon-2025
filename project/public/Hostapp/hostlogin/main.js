import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';
const errordiv=document.querySelectorAll(".error");

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

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
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try{
        showLoader();
        const {data}=await axios.post("http://127.0.0.1:3000/api/v1/project/host/login",{email,password});
        hideLoader();
        setTimeout(() => {
            alert(data.message);
        }, 100); 

        setTimeout(() => {
            document.cookie = `token=${data.token}; path=/; max-age=${60 * 60};`;
            window.location.href = 'http://127.0.0.1:3000/api/v1/project/host/hostdashboard';
        }, 100); 
        
    }
    catch(error)
    {
        hideLoader();
        if(error.response)
        {
            error.response.data.errors.forEach((item) => {
                if(item.field==="email")
                {
                    errordiv[0].textContent=`${item.message}`;
                }
                if(item.field==="password")
                {
                    errordiv[1].textContent=`${item.message}`;
                }
            });
        }
    }
  });