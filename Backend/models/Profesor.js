// models/Profesor.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ProfesorSchema = new mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: true,
    },
    fechaNacimiento: {
        type: Date,
        required: true,
    },
    identificacion: {
        type: String,
        required: true,
        unique: true,
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Por favor, ingresa un correo válido'],
    },
    telefono: {
        type: String,
        required: true,
    },
    alumnos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alumno',
    }],
    avatar: {
        type: String, // Ruta local del avatar
        default: '', // Opcional: una ruta por defecto
    },
    password: {
        type: String,
        required: true,
    },
});

// Middleware para hash de la contraseña antes de guardar
ProfesorSchema.pre('save', async function(next) {
    const profesor = this;

    // Solo hashear la contraseña si ha sido modificada o es nueva
    if (!profesor.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        profesor.password = await bcrypt.hash(profesor.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar contraseñas
ProfesorSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Profesor', ProfesorSchema);
