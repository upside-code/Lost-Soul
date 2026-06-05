// @ts-check
const toggle = document.getElementById("navToggle");
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () =>
{
    links.classList.toggle('active');
});






function validateForm() {
    let name = document.getElementById("name").value;
    if (name === "") {
        alert("Name must be filled out");
        return false;
    }
    let email = document.getElementById("email").value;
    if (email === "") {
        alert("Email must be filled out");
        return false;
    }
    let subject = document.getElementById("subject").value;
    if (subject === "") {
        alert("subject must be filled out");
        return false;
    }
    let source = document.querySelector('input[name="source"]:checked');
    if (!source) {
        alert("source must be filled out");
        return false;
    }
    let message = document.getElementById("message").value;
    if (message === "") {
        alert("message must be filled out");
        return false;
    }
    return true;
}

if (document.querySelector('.gallery')) {
    const images = document.querySelectorAll('.gallery img');// querySelectorAll returns a NodeList (index-based, like an array)
    const overlay = document.getElementById('overlay');
    const overlayImg = document.getElementById('overlayImg');
    let currentIndex = 0;// currentIndex tracks which image is currently open in the overlay

    images.forEach((img, index) => {//this works because const images is now index-based
        img.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = index;
            overlayImg.src = img.src;
            overlay.classList.remove('hidden');
        });
    });

    document.getElementById('closeBtn').addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length//modulo
        overlayImg.src = images[currentIndex].src;
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;//modulo
        overlayImg.src = images[currentIndex].src;
    });
}