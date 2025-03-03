import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';

const cardContainer = document.getElementById("packages");
const cardContainerhomestay = document.getElementById("homestays");
const dashboardlink=document.getElementById("dashboardlink");

dashboardlink.addEventListener('click', function(e) {
    e.preventDefault();  // Prevent the default link behavior
    window.location.replace('../index.html');  // Use window.location.replace() for navigation
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const token = getCookie('token');

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
let modal;

getdashboard().then((response)=>{
    email=response.email;
    fetchmylistings();
    cardContainer.addEventListener('click', function (e) {
        // Check if the clicked element is an "Edit" button
        if (e.target.classList.contains('edit')) {
            const cardId = e.target.id; // Get the card ID
            handleEdit(cardId);
        }
    
        // Check if the clicked element is a "Delete" button
        if (e.target.classList.contains('delete')) {
            const cardId = e.target.id; // Get the card ID
            handleDelete(cardId);
        }
    });

    cardContainerhomestay.addEventListener('click', function (e) {
        if (e.target.classList.contains('edithomestay')) {
            const cardId = e.target.id// Get the card ID
            handleEditHomestay(cardId);
        }
    
        if (e.target.classList.contains('deletehomestay')) {
            const cardId = e.target.id// Get the card ID
            handleDeleteHomestay(cardId);
        }
    });
})
.catch((error)=>{
    console.log(error);
})

async function handleEdit(cardId) {
    modal = new bootstrap.Modal(document.getElementById("addPackageModal"));
    modal.show();
    document.getElementById("addPackageModal").removeAttribute('inert');

    const form = document.getElementById("addPackageForm");

    // Ensure no existing submit listeners exist
    form.removeEventListener("submit", handleFormSubmit);

    // Add the submit event listener with `once: true` to trigger the listener only once
    form.addEventListener("submit", handleFormSubmit, { once: true });

    async function handleFormSubmit(e) {
        e.preventDefault();  // Prevent default form submission

        let imageBase64, title, text, imageFile, duration, price;
        try {
            const { data } = await axios.get("http://127.0.0.1:3000/api/cards");

            // Find the matching card
            const card = data.cards.find((card) => card.id === Number(cardId));
            title = document.getElementById("packageTitle").value || card.title;
            text = document.getElementById("packageText").value || card.text;
            imageFile = document.getElementById("packageImage").files[0];
            imageBase64 = imageFile ? await toBase64(imageFile) : card.image;
            duration = document.getElementById("packageDuration").value || card.duration;
            price = document.getElementById("packagePrice").value || card.price;
        } catch (error) {
            console.error("Error fetching card data:", error);
        }

        try {
            const newCard = { cardId, title, text, image: imageBase64, duration, price, email };
            const { data } = await axios.patch(`http://127.0.0.1:3000/api/cards/${cardId}`, newCard);

            fetchmylistings(); // Refresh the listings
            alert(data.message);

            // Reset the form and close the modal
            form.reset();
            modal.hide();
            document.getElementById("addPackageModal").setAttribute('inert', '');
        } catch (err) {
            console.error("Error editing card:", err);
            alert("Failed to edit the package. Please try again.");
        }
    }
}

async function handleEditHomestay(cardId) {
    modal = new bootstrap.Modal(document.getElementById("addhomestayModal"));
    modal.show();
    document.getElementById("addhomestayModal").removeAttribute('inert');

    const form = document.getElementById("addhomestayForm");

    // Ensure no existing submit listeners exist
    form.removeEventListener("submit", handleFormSubmit);

    // Add the submit event listener with `once: true` to trigger the listener only once
    form.addEventListener("submit", handleFormSubmit, { once: true });

    async function handleFormSubmit(e) {
        e.preventDefault();  // Prevent default form submission

        let imageBase64, title, text, imageFile, duration, price;

        try {
            const { data } = await axios.get("http://127.0.0.1:3000/api/cardshomestay");

            // Find the matching card
            const card = data.cards.find((card) => card.id === Number(cardId));
            title = document.getElementById("homestayTitle").value || card.title;
            text = document.getElementById("homestayText").value || card.text;
            imageFile = document.getElementById("homestayImage").files[0];
            imageBase64 = imageFile ? await toBase64(imageFile) : card.image;
            duration = document.getElementById("homestayDuration").value || card.duration;
            price = document.getElementById("homestayPrice").value || card.price;
        } catch (error) {
            console.error("Error fetching card data:", error);
        }

        try {
            const newCard = { cardId, title, text, image: imageBase64, duration, price, email };
            const { data } = await axios.patch(`http://127.0.0.1:3000/api/cardshomestay/${cardId}`, newCard);

            fetchmylistings();  // Refresh the listings
            alert(data.message);

            // Reset the form and close the modal
            form.reset();
            modal.hide();
            document.getElementById("addhomestayModal").setAttribute('inert', '');
        } catch (err) {
            console.error("Error editing homestay:", err);
            alert("Failed to edit the Homestay. Please try again.");
        }
    }
}


async function handleDelete(cardId)
{
    try{
        const {data}=await axios.delete(`http://127.0.0.1:3000/api/cards/${cardId}`);

        alert(data.message);

        const response=await axios.get("http://127.0.0.1:3000/api/cards");

        const cardstobeupdated=response.data.cards.filter((card)=>card.id>Number(cardId));

        // cardstobeupdated.forEach(async(card)=>{
        //     const updatedcardid=card.id-1;
        //     await axios.patch(`http://127.0.0.1:3000/api/cards/${card.id}`,{id:updatedcardid});
        // })

        

        // fetchmylistings();


        // Update all affected cards' IDs
        const updatePromises = cardstobeupdated.map(async (card) => {
            const updatedCardId = card.id - 1;
            return axios.patch(`http://127.0.0.1:3000/api/cards/${card.id}`, { id: updatedCardId });
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        // Fetch and re-render the listings
        await fetchmylistings();

        // document.querySelectorAll(".delete").forEach((button)=>{
        //     if(Number(button.getAttribute("id"))>Number(cardId))
        //     {
        //         button.setAttribute("id",Number(button.getAttribute("id")-1));
        //     }
        // });

        
    }
    catch(err)
    {
        console.error("Error deleting card:", err);
        alert("Failed to delete the package. Please try again.");
    }
}

async function handleDeleteHomestay(cardId)
{
    try{
        const {data}=await axios.delete(`http://127.0.0.1:3000/api/cardshomestay/${cardId}`);

        alert(data.message);

        const response=await axios.get("http://127.0.0.1:3000/api/cardshomestay");

        const cardstobeupdated=response.data.cards.filter((card)=>card.id>Number(cardId));

        // cardstobeupdated.forEach(async(card)=>{
        //     const updatedcardid=card.id-1;
        //     await axios.patch(`http://127.0.0.1:3000/api/cardshomestay/${card.id}`,{id:updatedcardid});
        // })

        // fetchmylistings();

        const updatePromises = cardstobeupdated.map(async (card) => {
            const updatedCardId = card.id - 1;
            return axios.patch(`http://127.0.0.1:3000/api/cardshomestay/${card.id}`, { id: updatedCardId });
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        // Fetch and re-render the listings
        await fetchmylistings();

        
    }
    catch(err)
    {
        console.error("Error deleting card:", err);
        alert("Failed to delete the package. Please try again.");
    }
}



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
            <div class="card-footer border-0 d-flex gap-2 p-0 ">
                <button type="button" class="btn btn-primary edit" id="${cardData.id}">Edit Package</button>
                <button type="button" class="btn btn-primary delete" id="${cardData.id}">Delete Package</button>
                <a href="../viewpackage/viewpackage.html?id=${cardData.id}" class="btn btn-primary">View Package</a>
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
            <div class="card-footer border-0 d-flex flex-wrap gap-2 p-0">
                <button type="button" class="btn btn-primary edithomestay" id="${cardData.id}">Edit Homestay</button>
                <button type="button" class="btn btn-primary deletehomestay" id="${cardData.id}">Delete Homestay</button>
                <a href="../viewhomestay/viewhomestay.html?id=${cardData.id}" class="btn btn-primary">View Homestay</a>
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

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}