const mongoose = require('mongoose');

const AlumnoSchema = new mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: true,
    },
    codigo: {
        type: String,
        required: true,
        unique: true,
    },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profesor',
        required: true,
    },
    niveles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nivel' }],
    avatar: {
        type: String, // URL del avatar
        default: '', // Opcional: una URL por defecto
    }},
    { timestamps: true });

    

module.exports = mongoose.model('Alumno', AlumnoSchema);