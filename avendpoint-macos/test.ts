// import net from "node:net";

// const socket = net.createConnection("/tmp/endpointagent.sock");

// socket.on("connect", () => {
//     socket.write(
//         JSON.stringify({
//             action: "restart"
//         })
//     );
// });

// socket.on("data", (data) => {
//     console.log(data.toString());
//     socket.end();
// });

// socket.on("error", (err) => {
//     console.error(err);
// });