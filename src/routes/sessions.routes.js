import { Router } from "express";

import { createHash, isValidPassword, verifyRequiredBody } from '../utils.js';
import usersManager from '../dao/users.manager.mdb.js';


import config from '../config.js';

const manager = new usersManager();
const router = Router()



const adminAuth = (req,res, next) =>{
    if(req.session.user.role !== 'admin')
        return res.status(401).send({origin: config.SERVER, payload: 'acceso no autorizado, se requiere autenticacion y admin'});
    next();
}


router.post('/login', verifyRequiredBody(['email','password']), async (req, res) =>{
    try{
        /*
        const savedFirstName = 'José';
        const savedLastName = 'Perez';
        const savedEmail = 'idux.net@gmail.com';
        const savedPassword = 'abc123';
        const savedRole = 'admin';
        */


        const {email, password} = req.body;
        const foundUser = await manager.getOne({email: email });


        if(foundUser && isValidPassword(password, foundUser.password)){
            const {password, ...filteredFoundUser} = foundUser;

            req.session.user = filteredFoundUser;
            req.session.save(err =>{
                if(err) return res.status(500).send({origin: config.SERVER, payload: null, error: err.message});

                res.redirect('/products')
            });
        } else {
            res.status(401).send({ origin: config.SERVER, payload:' datos de acceso no validos'});
        }
    }catch(err){
        res.status(500).send({origin: config.SERVER, payload: null, error: err.menssage})
    }
});

router.get('/private', adminAuth, async (req,res) =>{
    try{
        res.status(200).send({origin: config.SERVER, payload: 'bienvenido admin'});
    }catch(err){
        res.status(500).send({origin:config.SERVER, payload: null, error: err.message});
    }
});

router.get('/logout', async(req,res) =>{
    try{
        req.session.destroy((err) =>{
            if(err) return res.status(500).send({origin: config.SERVER, payload:'error al ejecutar logout', error:err})
            res.redirect('/login')
        });
    }catch(err){
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message})
    }
})

router.post('/register', async(req,res) =>{
    try{
        const {firstName, lastName, email, password} = req.body;
        const foundUser = await manager.getOne({email:email});
        

        if(!foundUser){
            const process = await manager.add({firstName, lastName, email, password: createHash(password)});
            res.status(200).send({origin: config.SERVER, payload: process});
        }else{
            res.status(400).send({ origin: config.SERVER, payload:'el email ya se encuentra registrado'})
        }
    }catch (err){
        res.status(500).send({origin: config.SERVER, payload: null, error: err.message});
    }
});

export default router;