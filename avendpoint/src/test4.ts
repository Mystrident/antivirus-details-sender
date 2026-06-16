// src/test4.ts

console.log("TEST 4 START");

const mod = await import("./services/telemetry.service.js");

console.log("TELEMETRY LOADED");
console.log(mod);