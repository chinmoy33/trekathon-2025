const result=document.querySelector(".result");

async function displayresult(){
    const {data}=await axios.post("/api/v1/project/login");
    result.innerHTML=`<p>${data.msg}</p>`;
}

displayresult();