// src/stores/sidebarStore.js
import { writable } from "svelte/store";

const savedState = localStorage.getItem("sidebarState") === "collapsed";

export const sidebarCollapsed = writable(savedState);

sidebarCollapsed.subscribe(value => {
  localStorage.setItem("sidebarState", value ? "collapsed" : "expanded");
});
