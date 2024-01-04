require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/routes'); // Importez vos routes d'utilisateurs

const app = express();
// Définissez EJS comme moteur de vue
app.set('view engine', 'ejs');

// Définissez le dossier où se trouvent vos fichiers EJS
app.set('views', path.join(__dirname, 'views'));

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/registerEnter', (req, res) => {
  res.render('registerEnter');
});

// app.get('/registerAdmin', (req, res) => {
//   res.render('registerAdmin');
// });


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Utilisez le middleware cookieParser



// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Connexion à MongoDB
 mongoose.connect('mongodb://localhost:27017/Nautimail')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Utilisation des routes d'utilisateurs
app.use(userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 

