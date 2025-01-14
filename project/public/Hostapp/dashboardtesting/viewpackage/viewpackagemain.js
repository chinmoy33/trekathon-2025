import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm';

const carouselitem = document.querySelector(".carousel-item>div>img");
const skeletonLoader = document.querySelector(".image-skeleton");
const titleElement = document.getElementById("package-title");
const descriptionElement = document.getElementById("package-description");
const priceElement = document.getElementById("package-price");

async function getcard() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    try {
        const { data } = await axios.get("http://127.0.0.1:3000/api/cards");
        
        // Find the matching card
        const card = data.cards.find((card) => card.id === Number(id));

        if (card) {
            const fetchResponse = await fetch(card.image);
            const blob = await fetchResponse.blob();

            // Create object URL for the image
            const url = URL.createObjectURL(blob);
            
            // Set the image source
            carouselitem.setAttribute("src", url);
            carouselitem.classList.add("loaded");

            // Hide the skeleton loader
            skeletonLoader.style.display = "none";

            // Populate Package Details
            titleElement.textContent = card.title;
            descriptionElement.textContent = card.text;
            priceElement.innerHTML = `Price: &#8377;${card.price}`;
        } else {
            console.error("No matching card found for the given ID");
        }
    } catch (error) {
        console.error("Error fetching card data:", error);
    }
}

getcard();
