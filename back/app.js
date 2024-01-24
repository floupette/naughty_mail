require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importez vos middlewares et routes personnalisés
const { authMiddleware, adminMiddleware } = require('./middlewares');
const userRoutes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 8000;

// Configuration de la base de données
mongoose.connect('mongodb://localhost:27017/Nautimail')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configuration de CORS pour permettre les requêtes cross-origin (important pour le fonctionnement avec un front-end séparé comme React)
app.use(cors());

// Middlewares pour analyser le corps de la requête et les cookies
app.use(express.json()); // Pour analyser le corps des requêtes en JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour analyser les corps des requêtes URL-encodés (formulaires)
app.use(cookieParser()); // Pour analyser les cookies

// Utilisation des routes définies dans routes/routes.js
app.use(userRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;




