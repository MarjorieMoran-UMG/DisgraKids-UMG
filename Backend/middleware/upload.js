// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta de destino
    },
    filename: function (req, file, cb) {
        // Genera un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrar tipos de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos JPEG, JPG y PNG'));
    }
};

// Configuración de Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // Límite de 2MB
    fileFilter: fileFilter
});

module.exports = upload;