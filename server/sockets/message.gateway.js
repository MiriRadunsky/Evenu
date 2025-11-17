// src/sockets/message.gateway.js
import { Server } from 'socket.io';
import * as messageService from '../services/message.service.js';
import jwt from 'jsonwebtoken';

export function initSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('No token');
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', socket => {
    console.log('Socket connected', socket.user.id);

    // הצטרפות לחדר לפי threadId
    socket.on('join_thread', threadId => {
      socket.join(threadId);
    });

    // שליחת הודעה
    socket.on('send_message', async msg => {
      const newMsg = await messageService.sendMessage(msg);
      io.to(msg.threadId).emit('new_message', newMsg);
    });
  });   
  return io;
}
