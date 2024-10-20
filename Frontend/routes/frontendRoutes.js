const express = require('express');
const router = express.Router();

// Ruta para la vista de login
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Iniciar Sesión' });
});

router.get('/principal', (req, res) => {
    res.render('menuMaestros', { title: 'Principal' });
});
router.get('/misAlumnos', (req, res) => {
    res.render('alumnos/misAlumnos', { title: 'Mis Alumnos' });
});

router.get('/', (req, res) => {
    res.render('inicio', { title: 'Aprender Jugando' });
});

router.get('/aprendeJugando/visual', (req, res) => {
    res.render('alumnos/visual', { title: 'Disgrafia Visual' });
});


router.get('/aprendeJugando/orden-Comprension', (req, res) => {
    res.render('alumnos/ordenComprension', { title: 'Disgrafia Orden y Comprension' });
});

router.get('/aprendeJugando/trazo-Letras', (req, res) => {
    res.render('alumnos/escrituraTrazado', { title: 'Disgrafia Trazado de Letras y Números' });
});
router.get('/aprendeJugando/auditivo', (req, res) => {
    res.render('alumnos/auditivo', { title: 'Disgrafia Auditiva' });
});


router.get('/aprendeJugando', (req, res) => {
    res.render('alumnos/menuModulos', { title: 'Menú principal de módulos' });
});

module.exports = router;