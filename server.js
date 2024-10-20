const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

dotenv.config();

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 día
        httpOnly: true,
        secure: false, // Cambiar a true si usas HTTPS
        sameSite: 'lax',
    },
}));

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Frontend', 'views'));

// Configurar carpeta pública para los avatares
app.use(express.static(path.join(__dirname, 'Frontend', 'public')));

// Rutas del Backend
const profesoresRouter = require('./Backend/routes/profesores');
const alumnosRouter = require('./Backend/routes/alumnos');
const authRouter = require('./Backend/routes/auth');
const punteos = require('./Backend/routes/punteos');
const reportes = require('./Backend/routes/reportes');

// Rutas del Frontend
const frontendRoutes = require('./Frontend/routes/frontendRoutes');

// Usar las rutas del Backend
app.use('/api/profesores', profesoresRouter);
app.use('/api/alumnos', alumnosRouter);
app.use('/api/punteos', punteos);
app.use('/api/auth', authRouter);
app.use('/api/', reportes);

// Usar las rutas del Frontend
app.use('/', frontendRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Conectado a MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
})
.catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
});

//Server