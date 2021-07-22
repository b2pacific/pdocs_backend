const app = require("express")();
const server = require("http").createServer(app);
const dotenv = require("dotenv");
dotenv.config();
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_PROD_URL,
    methods: ["GET", "POST"],
  },
});

console.log(process.env.NODE);

const cors = require("cors");

const crypto = require("crypto");

app.use(cors());

io.on("connection", (socket) => {
  // console.log("user connected");
  socket.on("initialize", function (data) {
    // console.log("initialize", data);

    socket.join(data);

    socket.roomCount = io.sockets.adapter.rooms.get(data).size;

    io.to(data).emit("update-members", io.sockets.adapter.rooms.get(data).size);
    socket.room = data;

    io.to(data).emit("get-data", socket.id);
  });
  socket.on("send-data", ({ value, id }) => {
    // console.log(value[0].children[0].text);
    io.to(id).emit("send-data", value);
  });
  socket.on("new-operations", function (data) {
    // console.log(data);
    io.to(data.id).emit("new-remote-operations", data);
  });

  socket.on("disconnecting", function () {
    //if (io.sockets.adapter.rooms.get(socket.room)!=undefined && socket.room!=undefined) {
    //if(io.nsps!=undefined) {
    // console.log(socket.room);
    // console.log(socket.roomCount);
    socket.roomCount = socket.roomCount - 1;
    io.to(socket.room).emit("update-members", socket.roomCount);
    socket.leave(socket.room);
    //}
    // console.log("disconnecting");
  });
});

app.get("/", (req, res) => {
  return res.send("Hello from Prashant");
});

app.get("/create", (req, res) => {
  crypto.randomBytes(6, (err, buf) => {
    if (err) console.log("Error", err);
    buf = buf.toString("hex");
    // console.log(buf);
    return res.json({ groupId: buf });
  });
});

server.listen(process.env.PORT, function () {
  console.log("Connected on ", process.env.PORT);
});
