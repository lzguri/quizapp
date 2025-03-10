function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

// Close dropdown if clicked outside
document.addEventListener("click", function(event) {
    const menu = document.getElementById("dropdownMenu");
    const profile = document.querySelector(".profile");
    if (!profile.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = "none";
    }
});
