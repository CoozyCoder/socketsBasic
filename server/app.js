import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const secretKey = "skhdsljlfdsljhdsljfghds";
app.get("/", (req, res) => {
  res.send("Working");
});
app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "sakhsdlshdsd" }, secretKey);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authentication Required"));

    const decode = jwt.verify(token, secretKey);

    next();
  });
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ message, room }) => {
    console.log(message, room);
    io.to(room).emit("recieve-message", message);
  });

  socket.on("join-room", (room) => {
    console.log("Joining Room", room);
    socket.join(room);
  });

  // // Emit is used for sending message
  // socket.emit("welcome",`Welcome to our Brand New Server.`)

  // // Send to everyone except the one who request
  // socket.broadcast.emit("welcome",`${socket.id} joined the server`)

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// App.listen create a new instance of the server, while we create a IO socket on server , so thats why we use server.listen to listen on existin server
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on Port ${process.env.PORT}`);
});
