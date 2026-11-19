import mongoose from "mongoose";

let UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, "O nome do usuário é obrigatório!"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "O email do usuário é obrigatório!"],
        trim: true
    },
    senhaHash: {
        type: String,
        required: true,
        select: false
    }
})

let Usuario = mongoose.model("Usuario", UserSchema)

export default Usuario