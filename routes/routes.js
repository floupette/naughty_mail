const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); 
const { authMiddleware, adminMiddleware } = require('../middlewares');

const router = express.Router();


// Route pour obtenir tous les utilisateurs (admin seulement)
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ message: err.message }));
});

// Route pour créer un nouvel utilisateur (admin seulement)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { firm_name, first_name, last_name, email, phone_number, password } = req.body;

        // Hacher le mot de passe avant de le sauvegarder
        const hashedPassword = await bcrypt.hash(password, 10);  // Le second argument est le nombre de tours de salage

        const newUser = new User({
            firm_name,
            first_name,
            last_name,
            email,
            phone_number,
            password: hashedPassword,  
            // Ajoutez d'autres champs si nécessaire
        });

        await newUser.save();

        res.status(201).json({ message: "Nouvel utilisateur créé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// Route pour obtenir un utilisateur spécifique par son nom d'entreprise
router.get('/users/:firm_name', authMiddleware, adminMiddleware, (req, res) => {
    User.findOne({ firm_name: req.params.firm_name })
    .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

// Route pour mettre à jour un utilisateur spécifique par son nom d'entreprise (admin seulement)
router.put('/users/:firm_name', authMiddleware, adminMiddleware, (req, res) => {
    User.findOneAndUpdate({ firm_name: req.params.firm_name }, req.body, { new: true })
    .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    })
    .catch(err => res.status(400).json({ message: err.message }));
});

// Route pour supprimer un utilisateur spécifique par son nom d'entreprise (admin seulement)
router.delete('/users/:firm_name', authMiddleware, adminMiddleware, (req, res) => {
    User.findOneAndRemove({ firm_name: req.params.firm_name })
    .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

// Route pour l'authentification des utilisateurs
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Définir le token dans un cookie
        res.cookie('jwtToken', token, { httpOnly: true, secure: true });

        // Rediriger l'utilisateur vers une page sécurisée ou envoyer une réponse positive
        res.redirect('/registerEnter');
    } else {
        res.status(401).send('Invalid email or password');
    }
});


module.exports = router;




// router.post('/registerAdmin', async (req, res) => {
//     try {
//         // Récupérez tous les champs nécessaires à partir de req.body
//         const { email, password, first_name, last_name, phone_number, firm_name } = req.body;
//         console.log("Received data:", req.body);  // Affiche les données reçues pour déboguer

//         // Vérifiez si l'email existe déjà
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             console.error("Un utilisateur avec cet email existe déjà.");
//             return res.redirect('/registerAdmin');  // Redirigez avec un message d'erreur approprié
//         }

//         // Hash le mot de passe avant de le stocker
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Créez un nouvel administrateur et sauvegardez-le dans la base de données
//         const newAdmin = new User({ 
//             firm_name,  // Assurez-vous que ces champs correspondent à votre modèle
//             first_name,
//             last_name,
//             phone_number,
//             email, 
//             password: hashedPassword, 
//             is_admin: true  // Ce champ identifie l'utilisateur en tant qu'administrateur
//         });

//         const savedAdmin = await newAdmin.save();
//         console.log("Nouvel administrateur enregistré avec succès :", savedAdmin);

//         res.redirect('/login');  // Redirigez vers la page de connexion ou vers la page d'accueil
//     } catch (error) {
//         console.error("Erreur lors de l'enregistrement de l'administrateur :", error);
//         res.redirect('/registerAdmin');  // En cas d'erreur, redirigez vers la page d'inscription de l'administrateur
//     }
// });