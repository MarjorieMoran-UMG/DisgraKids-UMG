const mongoose = require('mongoose');
const NivelSchema = new mongoose.Schema({
    alumnoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumno', required: true },
    tipo: { type: String, enum: ['Visual', 'Orden', 'Trazo', 'Auditivo'], required: true },
    punteo: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Nivel', NivelSchema);