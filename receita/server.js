import express from "express"
import mongoose from "../conexao.js"
import jwt from "jsonwebtoken"
import { autenticar } from "./autenticar.js"
import dotenv from "dotenv"
import Usuario from "./user.js"
import Receita from "./receita.js"
import { Router } from "express"
import bcrypt from "bcryptjs"

const router = express()
const port = 1331

router.use(express.json())

router.post("/cadastro", async (req, res) => {
    try{
        if(!req.body.nome || !req.body.email || !req.body.senha){
            return res.status(400).send({erro: "Nome, email e senha são obrigatórios"})
        }

        if(req.body.senha.length <= 8){
            return res.status(400).send({erro: "Senha deve ter no minimo 8 caracteres"})
        }

        let email = req.body.email.trim()
        let existente = await Usuario.find({email: email}) // Transforma em um array, para verificar se há algo dentro dele

        if(existente.length > 0){ // Verifica se existe emails iguais
            return res.status(400).send({erro: "Email já esta cadastrado!"})
        }

        let senhaHash = await bcrypt.hash(req.body.senha, 8)
        let usuario = await Usuario.create({
            nome: req.body.nome,
            email: email,
            senhaHash: senhaHash
        })

        res.status(201).send(usuario)
    }catch(erro){
        res.status(400).send({erro: erro.message})
    }
})

router.post("/login", async (req, res) => {
    if(!req.body.email || !req.body.senha){
            return res.status(400).send({erro: "Email e senha são obrigatórios"})
        }
    
        let email = req.body.email
        let senha = req.body.senha
    
        let encontrados = await Usuario.find({email: email}).select("+senhaHash")
    
        if(encontrados.length === 0){
            return res.status(401).send({erro: "Acesso não autoriazado"})
        }
    
        let usuario = encontrados[0] 
        
        let senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash)
    
        if(senhaCorreta === false){
            return res.status(401).send({erro: "Credenciais inválidas"})
        }
    
        /* if(email !== process.env.ADMIN_EMAIL || senha !== process.env.ADMIN_SENHA){
            return res.status(401).send({erro: "Credenciais inválidas, acesso não autorizado!"})
        } */
    
        /* let token = jwt.sign(
            {
                email: process.env.ADMIN_EMAIL,
                nome: process.env.ADMIN_NOME
            },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )
        */
    
        let token = jwt.sign(
            {
                email: usuario.email,
                nome: usuario.nome
            },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )
    
        res.send({token: token})
})

router.get("/receitas", async (req, res) => {
    let receitas = await Receita.find()
    if(receitas.length === 0){
        return res.send({messagem: "Não há nenhuma receita para mostrar"})
    }
    res.send(receitas)
})

router.get("/receitas/:id", async (req, res) => {
    try{
    let receita = await Receita.findById(req.params.id)
    if(receita === null){
        return res.status(404).send({erro: "Não há nenhuma receita para mostrar que corresponda a este ID"})
    }
    res.send(receita)
    }catch(erro){
        res.status(400).send({erro: erro.message})
    }
})

router.get("/minhas-receitas", autenticar, async (req, res) => {
    try{
    let receitas = await Receita.find()
    let minhaReceita = []
    if(receitas.length === 0){
        return res.send({messagem: "Não há nenhuma receita para mostrar"})
    }
    receitas.forEach((receita) => {
        if(receita.autor.email === req.usuario.email){
            minhaReceita.push(receita)
        }
    })
    res.send(minhaReceita)
    }catch(erro){
        res.status(400).send({erro: erro.message})
    }
})

router.post("/receitas", autenticar, async (req, res) => {
    try{
        req.body.autor = {nome: req.usuario.nome, email: req.usuario.email} 
        let receita = await Receita.create(req.body)
        res.status(201).send(receita)
    }catch(erro){
        res.status(400).send({erro: erro.message})
    }
})

router.put("/receitas/:id", autenticar, async (req, res) => {
    try{
        let receita = await Receita.findById(req.params.id)
        if(receita === null){
            return res.status(404).send({erro: "Receita não encontrada"})
        }
        if(receita.autor.email !== req.usuario.email){
            return res.status(403).send({erro: "Você só pode editar suas receitas!"})
        }
        delete req.body.autor
        receita = await Receita.findByIdAndUpdate(req.params.id, req.body)
        res.send({message: "Receita atualizada com sucesso"})
    }catch(erro){
        res.status(400).send({erro: erro.message})
    }
})

router.delete("/receitas/:id", autenticar, async (req, res) => {
    try{
        let receita = await Receita.findById(req.params.id)
        if(receita === null){
            return res.status(404).send({erro: "Receita não encontrada"})
        }
        if(receita.autor.email !== req.usuario.email){
            return res.status(403).send({erro: "Você só pode apagar suas receitas!"})
        }
        receita = await Receita.findByIdAndDelete(req.params.id)
        res.send({message: "Receita apagada com sucesso"})
    }catch(erro){
        res.status(400).send({erro: erro.message})
    }
})

router.listen(port, () => {
    console.log("Rodando em:", port)
})