// @ts-check
const toggle = document.getElementById("navToggle");
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () =>
{
    links.classList.toggle('active');
});