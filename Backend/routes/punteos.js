const express = require('express');
const router = express.Router();
const Alumno = require('../models/Alumno'); // Importar el modelo Alumno
const Nivel = require('../models/Nivel'); // Importar el modelo Nivel

// Ruta para asignar o actualizar el puntaje de un nivel
router.post('/asignar-punteo', async (req, res) => {
    const { codigo, tipo, punteo } = req.body;

    try {
        // Verificar si el alumno existe
        const alumno = await Alumno.findOne({ codigo });
        if (!alumno) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }

        // Buscar si ya existe un nivel de este tipo para este alumno
        let nivel = await Nivel.findOne({ alumnoId: alumno._id, tipo });

        if (nivel) {
            // Si ya existe, actualizar el puntaje
            nivel.punteo = punteo;
            await nivel.save();
        } else {
            // Si no existe, crear uno nuevo
            nivel = new Nivel({
                alumnoId: alumno._id,
                tipo,
                punteo
            });
            await nivel.save();

            // Agregar el nivel al array de niveles del alumno
            alumno.niveles.push(nivel._id);
            await alumno.save();
        }

        res.status(200).json({ message: 'Punteo asignado o actualizado exitosamente', nivel });
    } catch (err) {
        res.status(500).json({ message: 'Error al asignar el puntaje', error: err.message });
    }
});

module.exports = router;