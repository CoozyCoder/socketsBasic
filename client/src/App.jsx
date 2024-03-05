import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { io } from "socket.io-client";

const App = () => {
  // This one line create a socket
  const socket = useMemo(
    () =>
      io("http://localhost:5000", {
        withCredentials: true,
      }),
    []
  );
  const [messages, setMessages] = useState([]);
  const [message, setMessgage] = useState("");
  const [room, setRoom] = useState();
  const [socketID, setSocketID] = useState();
  const [roomName, setRoomName] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setMessgage("");
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      console.log("Connected on Client", socket.id);
    });

    socket.on("recieve-message", (message) => {
      console.log(message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("welcome", (message) => {
      console.log(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <Container maxWidth="sm">
      <Box sx={{ height: 200 }} />
      <Typography variant="h1" component="div" gutterBottom>
        Welcome to Socket.io
      </Typography>
      <Typography variant="h2" component="div" gutterBottom>
        {socketID}
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <TextField
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          Join
        </Button>
      </form>

      <form onSubmit={handleSubmit}>
        <TextField
          id="outlined-basic"
          label="Message"
          variant="outlined"
          value={message}
          onChange={(e) => setMessgage(e.target.value)}
        />
        <TextField
          id="outlined-basic"
          label="Room"
          variant="outlined"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          Send
        </Button>
      </form>

      <Stack>
        {messages?.map((message) => (
          <Typography variant="h2" component="div" gutterBottom>
            {message}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
