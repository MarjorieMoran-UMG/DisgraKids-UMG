const express = require('express');
const router = express.Router();
const Alumno = require('../models/Alumno');
const authMiddleware = require('../middleware/authMiddleware'); // Importa el middleware de autenticación

// Rutas protegidas con autenticación

// Obtener todos los alumnos del profesor autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const alumnos = await Alumno.find({ profesor: req.profesor._id }).populate('profesor');
        res.json(alumnos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un alumno específico del profesor autenticado
router.get('/:id', authMiddleware, getAlumno, (req, res) => {
    res.json(res.alumno);
});

// Crear un nuevo alumno con avatar (URL)
router.post('/', authMiddleware, async (req, res) => {
    const { nombreCompleto, codigo, avatar } = req.body; // Ahora esperamos un avatar URL en el cuerpo de la solicitud

    try {
        // Verificar si el código ya existe
        const existingAlumno = await Alumno.findOne({ codigo });
        if (existingAlumno) {
            return res.status(400).json({ message: 'El código del alumno ya existe' });
        }

        const alumno = new Alumno({
            nombreCompleto,
            codigo,
            profesor: req.profesor._id, // Asigna el profesor autenticado
            avatar, // Aquí se guarda la URL del avatar
        });

        const nuevoAlumno = await alumno.save();
        req.profesor.alumnos.push(nuevoAlumno._id);
        await req.profesor.save();
        res.status(201).json({
            message: 'Alumno creado exitosamente',
            alumno: {
                _id: nuevoAlumno._id,
                nombreCompleto: nuevoAlumno.nombreCompleto,
                codigo: nuevoAlumno.codigo,
                avatar: nuevoAlumno.avatar,
            }
        });
    } catch (err) {
        res.status(400).json({ message: 'Error al crear el alumno', error: err.message });
    }
});

router.patch('/avatar/:id', async (req, res) => {
    const { nombreCompleto, codigo, avatar } = req.body;

    try {
        // Buscar al alumno por ID
        const alumno = await Alumno.findById(req.params.id);
        if (alumno == null) {
            return res.status(404).json({ message: 'No se encontró el alumno' });
        }

        // Actualizar los campos solo si están presentes en la solicitud
        if (nombreCompleto != null) {
            alumno.nombreCompleto = nombreCompleto;
        }
        if (codigo != null) {
            alumno.codigo = codigo;
        }
        if (avatar != null) {
            alumno.avatar = avatar; // Actualiza la URL del avatar
        }

        // Guardar los cambios
        const alumnoActualizado = await alumno.save();

        // Enviar la respuesta con los datos actualizados
        res.json({
            message: 'Alumno actualizado exitosamente',
            alumno: {
                _id: alumnoActualizado._id,
                nombreCompleto: alumnoActualizado.nombreCompleto,
                codigo: alumnoActualizado.codigo,
                avatar: alumnoActualizado.avatar,
            }
        });

    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar el alumno', error: err.message });
    }
});



// Actualizar un alumno y su avatar (URL)
router.patch('/:id', getAlumno, async (req, res) => {
    const { nombreCompleto, codigo, avatar } = req.body;

    if (nombreCompleto != null) {
        res.alumno.nombreCompleto = nombreCompleto;
    }
    if (codigo != null) {
        res.alumno.codigo = codigo;
    }
    if (avatar != null) {
        res.alumno.avatar = avatar; // Actualiza la URL del avatar
    }

    try {
        const alumnoActualizado = await res.alumno.save();
        res.json({
            message: 'Alumno actualizado exitosamente',
            alumno: {
                _id: alumnoActualizado._id,
                nombreCompleto: alumnoActualizado.nombreCompleto,
                codigo: alumnoActualizado.codigo,
                avatar: alumnoActualizado.avatar,
            }
        });
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar el alumno', error: err.message });
    }
});

// Eliminar un alumno
router.delete('/:id', authMiddleware, getAlumno, async (req, res) => {
    try {
        req.profesor.alumnos = req.profesor.alumnos.filter(alumnoId => alumnoId.toString() !== res.alumno._id.toString());
        await req.profesor.save();
        await res.alumno.remove();
        res.json({ message: 'Alumno eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rutas sin autenticación

// Endpoint para buscar a un alumno por código (sin autenticación)
router.get('/buscar/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const alumno = await Alumno.findOne({ codigo });
        if (!alumno) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }
        res.json({
            _id: alumno._id,
            nombreCompleto: alumno.nombreCompleto,
            avatar: alumno.avatar,
            codigo: alumno.codigo
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// Middleware para obtener alumno por ID
async function getAlumno(req, res, next) {
    let alumno;
    try {
        alumno = await Alumno.findById(req.params.id).populate('profesor');
        if (alumno == null) {
            return res.status(404).json({ message: 'No se encontró el alumno' });
        }

        if (alumno.profesor._id.toString() !== req.profesor._id.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a este alumno' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.alumno = alumno;
    next();
}

module.exports = router;
