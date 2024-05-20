const app = require("./app");
const http = require('http')
const hashMap = require('hashmap')
const dotenv = require("dotenv");
const {connectDatabase} = require("./config/database")


let server = http.createServer(app);
let io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});


let clients = new hashMap(); // for online sessions

io.use(async (socket, next) => {

    console.log("socket : " + socket);
    return next()

    // try {
    //     //check to see if there is such a user?
    //     let user = await User.findOne({ public_key: socket.handshake.query.public_key });
    //     if (user) {//exist : store user to hashmap and next()
    //         clients.set(socket.id, (user._id).toString())
    //         console.log(clients)
    //         await User.findByIdAndUpdate(user._id, { last_seen: 0 });
    //         return next();
    //     } else {//not exist: don't allow user
    //         console.log("err")
    //     }
    // } catch (e) {
    //     console.log(e)
    // }
})
io.on('connection', function (socket) {

    console.log("[socket] connected :" + socket.id);

    //event join room
    socket.on('join', async function (data) {
        console.log("join " + data);
        socket.join(data)
    })

    socket.on('device-connect', async function (data) {
        socket.to(data.connectionuid).emit("device-connect", { ...data, socketid: socket.id });
        console.log(socket.id + " : device-connect :  " + JSON.stringify(data));
    })
    socket.on('device-remove', async function (data) {
        console.log(socket.id + " : device-remove :  " + JSON.stringify(data));
        io.to(data.socketid).emit("device-remove");
        io.sockets.sockets.forEach((socket) => {
            // If given socket id is exist in list of all sockets, kill it
            if (socket.id === data.socketid)
                socket.disconnect(true);
        });

        // if (io.sockets.connected[data.socketid]) {
        //     io.sockets.connected[data.socketid].disconnect();
        // }
        // io.of("/").connected[data.socketid].leave(data.connectionuid)

    })
    socket.on('disconnect', async function () {
        console.log("[socket] disconnected :" + socket.id);
        io.emit("device-disconnect", { socketid: socket.id });

    })
    socket.on('connect', async function () {
        console.log("[socket] connected :" + socket.id);
        io.emit("connect", { socketid: socket.id });

    })
});


// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

//config 
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
}

connectDatabase()

server.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});
// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});
