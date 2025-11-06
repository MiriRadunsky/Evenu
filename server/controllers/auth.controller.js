// src/controllers/auth.controller.js
import { registerUser, login } from '../services/auth.service.js';
const asyncHandler = require('../middlewares/asyncHandler');


exports.register = asyncHandler(async(req, res)=> {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered', user });  
});

exports.login = asyncHandler(async(req, res) =>{
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.json({ user, token });
});
