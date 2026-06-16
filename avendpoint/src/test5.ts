// src/test5.ts

console.log("TEST 5 START");

const mod = await import("./collectors/antivirus.js");

console.log("ANTIVIRUS LOADED");
console.log(mod);