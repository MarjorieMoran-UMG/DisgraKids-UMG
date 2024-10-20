// middleware/authMiddleware.js
const Profesor = require('../models/Profesor');

const authMiddleware = async (req, res, next) => {
    if (req.session && req.session.profesorId) {
        try {
            const profesor = await Profesor.findById(req.session.profesorId);
            if (profesor) {
                req.profesor = profesor;
                return next();
            } else {
                return res.status(401).json({ message: 'Autenticación requerida' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error al verificar la sesión', error: err.message });
        }
    } else {
        return res.status(401).json({ message: 'Autenticación requerida' });
    }
};

module.exports = authMiddleware;
