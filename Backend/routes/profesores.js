const express = require('express');
const router = express.Router();
const Profesor = require('../models/Profesor');
const Alumno = require('../models/Alumno');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas a continuación requerirán autenticación
router.use(authMiddleware);

// Obtener el perfil del profesor autenticado
router.get('/profile', async (req, res) => {
    try {
        const profesor = await Profesor.findById(req.profesor._id).populate('alumnos');
        res.json(profesor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar el perfil del profesor y su avatar (URL)
router.patch('/profile', async (req, res) => {
    const { nombreCompleto, fechaNacimiento, identificacion, correo, telefono, password, avatar } = req.body;

    if (nombreCompleto != null) {
        req.profesor.nombreCompleto = nombreCompleto;
    }
    if (fechaNacimiento != null) {
        req.profesor.fechaNacimiento = fechaNacimiento;
    }
    if (identificacion != null) {
        req.profesor.identificacion = identificacion;
    }
    if (correo != null) {
        req.profesor.correo = correo;
    }
    if (telefono != null) {
        req.profesor.telefono = telefono;
    }
    if (password != null) {
        req.profesor.password = password; // Será hasheada automáticamente
    }
    if (avatar != null) {
        req.profesor.avatar = avatar; // Actualiza la URL del avatar
    }

    try {
        const profesorActualizado = await req.profesor.save();
        res.json({
            message: 'Profesor actualizado exitosamente',
            profesor: {
                _id: profesorActualizado._id,
                nombreCompleto: profesorActualizado.nombreCompleto,
                correo: profesorActualizado.correo,
                avatar: profesorActualizado.avatar,
            }
        });
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar el profesor', error: err.message });
    }
});

// Obtener los alumnos del profesor autenticado
router.get('/alumnos', async (req, res) => {
    try {
        // Buscar los alumnos del profesor y poblar sus niveles
        const alumnos = await Alumno.find({ profesor: req.profesor._id })
            .populate('niveles');

        // Calcular el promedio de los niveles para cada alumno
        const alumnosConPromedio = alumnos.map(alumno => {
            // Sumar los puntajes de los niveles
            const totalPuntaje = alumno.niveles.reduce((sum, nivel) => sum + nivel.punteo, 0);
            // Calcular el promedio si hay niveles, si no, poner 0
            const promedio = alumno.niveles.length ? (totalPuntaje / 4).toFixed(2) : 0;

            return {
                ...alumno._doc, // Para mantener todos los datos originales del alumno
                promedio: Number(promedio) // Agregar el campo promedio
            };
        });

        res.json(alumnosConPromedio);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
