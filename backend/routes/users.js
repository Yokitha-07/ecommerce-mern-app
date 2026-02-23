const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function authorize(roles=[]){
    return (req,res,next)=>{
        const token = req.headers['authorization']?.split(' ')[1];
        if(!token) return res.status(401).json({msg:'Unauthorized'});
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if(!roles.includes(decoded.role)) return res.status(403).json({msg:'Forbidden'});
            req.user = decoded;
            next();
        } catch(e){ res.status(401).json({msg:'Invalid token'}) }
    }
}

router.get('/', authorize(['admin']), async (req,res)=>{
const users = await User.find().select('-passwordHash');
res.json(users);
});

router.post('/create', authorize(['admin']), async (req,res)=>{
    const { name,email,password,role } = req.body;
    if(await User.findOne({email})) return res.status(400).json({msg:'Email exists'});
    const hash = await bcrypt.hash(password,10);
    const user = new User({ name,email,passwordHash:hash,role });
    await user.save();
    res.json({ success:true });
});

router.put('/:id', authorize(['admin']), async (req,res)=>{
    const { name,email,role } = req.body;
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({msg:'User not found'});
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    await user.save();
    res.json({ success:true });
});

router.delete('/:id', authorize(['admin']), async (req,res)=>{
    await User.findByIdAndDelete(req.params.id);
    res.json({ success:true });
});

module.exports = router;