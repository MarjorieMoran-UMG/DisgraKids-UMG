// routes/auth.js
const express = require('express');
const router = express.Router();
const Profesor = require('../models/Profesor');


// Registro de Profesores
router.post('/register', async (req, res) => {
    const { nombreCompleto, fechaNacimiento, identificacion, correo, telefono, password, avatar } = req.body;

    try {
        // Verificar si el correo o identificación ya existen
        const existingProfesor = await Profesor.findOne({ 
            $or: [{ correo }, { identificacion }] 
        });
        if (existingProfesor) {
            return res.status(400).json({ message: 'Correo o Identificación ya existen' });
        }

        const profesor = new Profesor({
            nombreCompleto,
            fechaNacimiento,
            identificacion,
            correo,
            telefono,
            password, // Será hasheada automáticamente por el middleware
            avatar
        });

        const nuevoProfesor = await profesor.save();
        req.session.profesorId = nuevoProfesor._id; // Iniciar sesión automáticamente después del registro
        res.status(201).json({ 
            message: 'Profesor registrado exitosamente',
            profesor: {
                _id: nuevoProfesor._id,
                nombreCompleto: nuevoProfesor.nombreCompleto,
                correo: nuevoProfesor.correo,
                avatar: profesor.avatar,
                // No se envía la contraseña por seguridad
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar el profesor', error: err.message });
    }
});

// Inicio de Sesión de Profesores
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Verificar si el profesor existe
        const profesor = await Profesor.findOne({ correo });
        if (!profesor) {
            return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Verificar la contraseña
        const isMatch = await profesor.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Iniciar sesión
        req.session.profesorId = profesor._id;
        res.json({
            message: 'Inicio de sesión exitoso',
            profesor: {
                _id: profesor._id,
                nombreCompleto: profesor.nombreCompleto,
                correo: profesor.correo,
                avatar: profesor.avatar,
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
    }
});

// Cerrar Sesión
router.post('/logout', (req, res) => {
    if (req.session.profesorId) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión', error: err.message });
            }
            res.clearCookie('connect.sid'); // Nombre por defecto de la cookie de sesión
            return res.json({ message: 'Sesión cerrada exitosamente' });
        });
    } else {
        res.status(400).json({ message: 'No hay sesión activa' });
    }
});

module.exports = router;
