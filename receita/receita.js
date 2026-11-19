import mongoose from "mongoose";

let receitaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        minlength: [3, "O titulo precisa de pelo menos 3 letras"],
        required: [true, "O titulo é obrigatorio"],
        trim: true
    },
    categoria: {
        type: String,
        enum: {
            values: ["Doce", "Salgado", "Bebida"],
            message: "{VALUE} não é uma categoria válida"
        },
        default: "Salgado"
    },
    tempoPreparo: {
        type: Number,
        min: [1, "O tempo de preparo precisa ser de pelo menos 1 minuto"]
    },
    ingredientes: [{
        nome: {
            type: String,
            required: [true, "O ingrediente precisa de um nome"],
            trim: true
        },
        quantidade: {
            type: String,
            trim: true
        }
    }],
    autor: {
        nome: {
        type: String,
        required: [true, "O nome do autor é obrigatório!"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "O email do autor é obrigatório!"],
        trim: true
    }
    }
})

let Receita = mongoose.model("Receitas", receitaSchema)

export default Receita