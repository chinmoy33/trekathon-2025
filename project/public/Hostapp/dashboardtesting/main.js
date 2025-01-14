import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';
// import path from 'path';
// import { fileURLToPath } from 'url';

const welcomediv = document.getElementById("welcomediv");
const addPackageButton = document.querySelector(".add-package");
const cardContainer = document.getElementById("packages");
const cardContainerhomestay = document.getElementById("homestays");
const logout=document.getElementById("logout");
const addhomestayButton = document.querySelector(".add-homestay");
const input=document.querySelector(".form-control");
const searchform=document.querySelector(".d-flex");
const mylistings=document.getElementById("mylistings");
const getallpackages=document.getElementById("getallpackages");
const editLink = document.querySelector("#edit>a");

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const token = getCookie('token');

logout.addEventListener("click",()=>{
    document.cookie = `token=${token}; path=/; max-age=${0};`;
    //alert("You have been logged out successfully");
    location.reload();
})

async function getdashboard() {
    try {
        const { data } = await axios.post("http://127.0.0.1:3000/api/v1/project/host/hostdashboard", {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return data;
    } catch (error) {
        alert("You have been logged out.\nPlease login again to continue.");
        console.error("Error fetching dashboard:", error);
        welcomediv.textContent = error.response?.data?.message || "Error fetching dashboard.";
        return null;
    }
}

let email;

getdashboard().then((response) => {
    if (response) {
        email=response.email;
        welcomediv.textContent = `${response.message}`;

        
        let modal=null;
        // Handle "Add your package" button click
        addPackageButton.addEventListener("click", () => {
            modal = new bootstrap.Modal(document.getElementById("addPackageModal"));
            modal.show();
            document.getElementById("addPackageModal").removeAttribute('inert');
        });

        // Handle package form submission
        document.getElementById("addPackageForm").addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("packageTitle").value;
            const text = document.getElementById("packageText").value;
            const imageFile = document.getElementById("packageImage").files[0];
            const duration= document.getElementById("packageDuration").value;
            const price= document.getElementById("packagePrice").value;
            let id;

            try{
                const response = await fetch("http://127.0.0.1:3000/api/cards");  //response={cards,nbhits}
                const cards = await response.json();
                id=cards.nbhits+1;
            }
            catch(error)
            {
                console.log(error);
            }

            if (!imageFile) {
                alert("Please upload an image.");
                return;
            }

            try {
                const imageBase64 = await toBase64(imageFile);
                const newCard = { id, title, text, image: imageBase64, duration, price, email };

                const response = await fetch("http://127.0.0.1:3000/api/cards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCard),
                });

                const savedCard = await response.json();
                if(cardContainer.contains(cardContainer.querySelector("#packages>p")))
                {
                    cardContainer.innerHTML="<h2>Travel Packages</h2>";
                } 
                renderCard(savedCard);

                // Reset the form and close the modal
                addPackageForm.reset();
                //const modalElement = bootstrap.Modal.getInstance(document.getElementById("addPackageModal"));
                modal.hide();
                document.getElementById("addPackageModal").setAttribute('inert', '');
            } catch (err) {
                console.error("Error adding card:", err);
                alert("Failed to add the package. Please try again.");
            }
        });

        addhomestayButton.addEventListener("click", () => {
            modal = new bootstrap.Modal(document.getElementById("addhomestayModal"));
            modal.show();
            document.getElementById("addhomestayModal").removeAttribute('inert');
        });

        // Handle package form submission
        document.getElementById("addhomestayForm").addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("homestayTitle").value;
            const text = document.getElementById("homestayText").value;
            const imageFile = document.getElementById("homestayImage").files[0];
            const duration= document.getElementById("homestayDuration").value;
            const price= document.getElementById("homestayPrice").value;
            let id;

            try{
                const response = await fetch("http://127.0.0.1:3000/api/cardshomestay");  //response={cards,nbhits}
                const cards = await response.json();
                id=cards.nbhits+1;
            }
            catch(error)
            {
                console.log(error);
            }

            if (!imageFile) {
                alert("Please upload an image.");
                return;
            }

            try {
                const imageBase64 = await toBase64(imageFile);
                const newCard = { id, title, text, image: imageBase64, duration, price, email };

                const response = await fetch("http://127.0.0.1:3000/api/cardshomestay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCard),
                });

                const savedCard = await response.json();
                if(cardContainerhomestay.contains(cardContainerhomestay.querySelector("#homestays>p")))
                {
                    cardContainerhomestay.innerHTML="<h2>Homestays</h2>";
                } 
                renderCardhomestay(savedCard);

                // Reset the form and close the modal
                addhomestayForm.reset();
                //const modalElement = bootstrap.Modal.getInstance(document.getElementById("addPackageModal"));
                modal.hide();
                document.getElementById("addhomestayModal").setAttribute('inert', '');
            } catch (err) {
                console.error("Error adding card:", err);
                alert("Failed to add the package. Please try again.");
            }
        });

        // Fetch and render all cards
        fetchCards();
        fetchCardshomestay();

        //My Listings
        mylistings.addEventListener("click",()=>{
            console.log("i am here");
            fetchmylistings();
        });
        
        // console.log(editLink);
        // console.log(editLink.href);
        // editLink.addEventListener("click",(e)=>{
        //     e.preventDefault();

        //     const targetPath = 'editpackage/editpackage.html';
        //     const queryParams = `?email=${email}`;
        //     const fullPath = `${targetPath}${queryParams}`;

        //     //console.log("Navigating to:", fullPath);
        //     window.location.href = fullPath; // Navigate to the constructed URL
        // }); 

    }
}).catch((error) => {
    console.log(error);
});

searchform.addEventListener("submit",async(e)=>{
    e.preventDefault();

    const name=input.value
    try{
        const {data}=await axios.post("/api/v1/project/host/hostdashboard/searchpackage",{name:name});
        cardContainer.innerHTML=`<h2>Travel Packages</h2>`;
        data.forEach(renderCard);
    }
    catch(error)
    {
        if(error.response.status==404)
        {
            cardContainer.innerHTML=`<h2>Travel Packages</h2>
                                     <p>No results found!</p>`;
        }
        else{
            console.log(error);
        }
    }

    try{
        const response=await axios.post("/api/v1/project/host/hostdashboard/searchhomestay",{name:name});
        console.log(response.status);
        cardContainerhomestay.innerHTML=`<h2>Homestays</h2>`;
        response.data.forEach(renderCardhomestay);
    }
    catch(error)
    {
        if(error.response.status==404)
        {
            cardContainerhomestay.innerHTML=`<h2>Homestays</h2>
                                     <p>No results found!</p>`;
        }
        else{
            console.log(error);
        }
    }
    

});

getallpackages.addEventListener("click",()=>{
    cardContainer.innerHTML="<h2>Travel Packages</h2>";
    cardContainerhomestay.innerHTML="<h2>Homestays</h2>";
    fetchCards();
    fetchCardshomestay();
});

// Function to render a card
function renderCard(cardData) {
    const card = document.createElement("div");
    card.classList.add("col-sm-3");

    card.innerHTML = `
        <div class="card h-100" style="width: 18rem;">
            <img src="${cardData.image}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${cardData.title}</h5>
                <p class="card-text" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                    ${cardData.text}
                </p>
            </div>
            <div class="card-footer border-0">
                <a href="./viewpackage/viewpackage.html?id=${cardData.id}" class="btn btn-primary">View Package</a>
            </div>
        </div>
    `;

    cardContainer.appendChild(card);
}

function renderCardhomestay(cardData) {
    const card = document.createElement("div");
    card.classList.add("col-sm-3");

    card.innerHTML = `
        <div class="card h-100" style="width: 18rem;">
            <img src="${cardData.image}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${cardData.title}</h5>
                <p class="card-text" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                    ${cardData.text}
                </p>
            </div>
            <div class="card-footer border-0">
                <a href="./viewhomestay/viewhomestay.html?id=${cardData.id}" class="btn btn-primary">View Homestay</a>
            </div>
        </div>
    `;

    cardContainerhomestay.appendChild(card);
}

// Fetch cards from the backend
async function fetchCards() {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/cards");  //response={cards,nbhits}
        const cards = await response.json();     // therefore cards is also {cards,nbhits}
        cards.cards.forEach(renderCard);    // So we perform cards.cards to access the cards object
    } catch (err) {
        console.error("Error fetching cards:", err);
    }
}

// Fetch cards from the backend
async function fetchCardshomestay() {
    try {
        const response = await fetch("http://127.0.0.1:3000/api/cardshomestay");
        const cards = await response.json();
        cards.cards.forEach(renderCardhomestay);
    } catch (err) {
        console.error("Error fetching cards:", err);
    }
}

async function fetchmylistings(){
    try {
        cardContainer.innerHTML="<h2>Travel Packages</h2>";
        cardContainerhomestay.innerHTML="<h2>Homestays</h2>";
        const response = await fetch("http://127.0.0.1:3000/api/cards");
        const cards = await response.json();
        const packagecard = cards.cards.filter((card) => card.email === email);
        if(packagecard.length==0)
        {
            cardContainer.innerHTML="<h2>Travel Packages</h2><p>You do not have any travel package listings!</p>";
        }
        packagecard.forEach(renderCard);
        const responsehomestay = await fetch("http://127.0.0.1:3000/api/cardshomestay");
        const cardshomestay = await responsehomestay.json();
        const homestaycard = cardshomestay.cards.filter((card) => card.email === email);
        if(homestaycard.length==0)
        {
            cardContainerhomestay.innerHTML="<h2>Homestays</h2><p>You do not have any homestay listings!</p>";
        }
        homestaycard.forEach(renderCardhomestay);
    } catch (err) {
        console.error("Error fetching cards:", err);
    }
}

// Convert image to base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
