const express = require('express');
const router = express.Router();
const Alumno = require('../models/Alumno');
const Profesor = require('../models/Profesor');
const authMiddleware = require('../middleware/authMiddleware'); // Importar el middleware de autenticación

// Ruta para generar el reporte de alumnos para un profesor
router.get('/reporte', authMiddleware, async (req, res) => {
    try {
        // Obtener el ID del profesor autenticado del middleware
        const profesorId = req.profesor._id;

        // Obtener el profesor con su nombre
        const profesor = await Profesor.findById(profesorId).select('nombreCompleto');
        if (!profesor) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }

        // Obtener todos los alumnos del profesor con sus niveles poblados
        const alumnos = await Alumno.find({ profesor: profesorId })
            .populate({
                path: 'niveles',
                select: 'tipo punteo'
            })
            .exec();

        // Construir el reporte con la información de cada alumno y sus puntajes
        const reporte = alumnos.map(alumno => {
            const visual = alumno.niveles.find(n => n.tipo === 'Visual')?.punteo || 0;
            const orden = alumno.niveles.find(n => n.tipo === 'Orden')?.punteo || 0;
            const trazo = alumno.niveles.find(n => n.tipo === 'Trazo')?.punteo || 0;
            const auditivo = alumno.niveles.find(n => n.tipo === 'Auditivo')?.punteo || 0;

            return {
                nombreCompleto: alumno.nombreCompleto,
                codigo: alumno.codigo,
                visual,
                orden,
                trazo,
                auditivo
            };
        });

        // Devolver el reporte junto con el nombre del profesor
        res.status(200).json({
            profesor: profesor.nombreCompleto,
            reporte
        });
    } catch (err) {
        res.status(500).json({ message: 'Error al generar el reporte', error: err.message });
    }
});

module.exports = router;
