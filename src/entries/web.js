// src/entries/app.js
import '../stylesheets/styles.css';
import '../stylesheets/web.css';

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");
    
    // 1️⃣ Aplicar estado guardado al cargar
    const sidebarState = localStorage.getItem("sidebarState");
    if (sidebarState === "collapsed") {
        sidebar.classList.add("collapsed");
    }

    // 2️⃣ Evento toggle + guardar estado
    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed");

        if (sidebar.classList.contains("collapsed")) {
            localStorage.setItem("sidebarState", "collapsed");
        } else {
            localStorage.setItem("sidebarState", "expanded");
        }
    });
});
