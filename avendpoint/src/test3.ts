// src/test3.ts

console.log("TEST 3 START");

const mod = await import("./transport/api.js");

console.log("API LOADED");
console.log(mod);