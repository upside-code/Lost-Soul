// @ts-check
const toggle = document.getElementById("navToggle");
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () =>
{
    links.classList.toggle('active');
});


//const lightbox = GLightbox({});



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