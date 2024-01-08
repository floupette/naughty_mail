require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

// Importez vos middlewares et routes personnalisés
const { authMiddleware, adminMiddleware } = require('./middlewares');
const userRoutes = require('./routes/routes');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 8000;

// Configuration de la base de données
mongoose.connect('mongodb://localhost:27017/Nautimail')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configuration du moteur de vue EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares pour analyser le corps de la requête et les cookies
app.use(express.json()); // Pour analyser le corps des requêtes en JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour analyser les corps des requêtes URL-encodés (formulaires)
app.use(cookieParser()); // Pour analyser les cookies
app.use(methodOverride('_method'));

// Routes statiques pour le rendu de pages spécifiques
// Assurez-vous qu'il n'y a pas de conflit avec les routes dans routes/routes.js
app.get('/login', (req, res) => res.render('login'));
app.get('/registerEnter', (req, res) => res.render('registerEnter'));
// app.get('/registerAdmin', (req, res) => res.render('registerAdmin')); // Décommentez si nécessaire

// Utilisation des routes définies dans routes/routes.js
app.use(userRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;


