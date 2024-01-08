const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); 
const { authMiddleware, adminMiddleware } = require('../middlewares');
const { sendMail } = require('../mailer');

const router = express.Router();

// Route pour obtenir tous les utilisateurs (admin seulement)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ message: "Utilisateurs récupérés avec succès", users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour créer un nouvel utilisateur (admin seulement)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { firm_name, first_name, last_name, email, phone_number, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firm_name,
            first_name,
            last_name,
            email,
            phone_number,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: "Nouvel utilisateur créé avec succès", user: newUser });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// Route pour obtenir un utilisateur spécifique par son nom d'entreprise
router.get('/users/:firm_name', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ firm_name: req.params.firm_name });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: "Utilisateur récupéré avec succès", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Route pour mettre à jour un utilisateur spécifique par son nom d'entreprise (admin seulement)
router.put('/users/:firm_name', authMiddleware, adminMiddleware, async (req, res) => {
    const firmName = req.params.firm_name;
    try {
        const updatedUser = await User.findOneAndUpdate({ firm_name: firmName }, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


// Route pour supprimer un utilisateur spécifique par son nom d'entreprise (admin seulement)
router.delete('/users/:firm_name', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ firm_name: req.params.firm_name });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour la connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id, is_admin: user.is_admin, firm_name: user.firm_name }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('jwtToken', token, { httpOnly: true, secure: true });
        res.json({ message: "Connexion réussie", token, user });
    } else {
        res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
});

// Route pour accuser réception du courrier
router.post('/users/:firm_name/reception', authMiddleware, async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate({ firm_name: req.params.firm_name }, { has_mail: false, last_pick_up: new Date() }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Accusé de réception du courrier effectué', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Route pour notifier les utilisateurs d'un nouveau courrier (admin seulement)
router.post('/notify_mail', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const firmsToNotify = req.body.firmsToNotify;
        const users = await User.find({ firm_name: { $in: firmsToNotify } });
        users.forEach(async (user) => {
            await User.findOneAndUpdate({ firm_name: user.firm_name }, { has_mail: true });
            sendMail(user.email, "Nouveau Courrier", "Vous avez reçu un nouveau courrier.");
        });
        res.json({ message: "Notifications de courrier envoyées avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'envoi des notifications de courrier." });
    }
});

// route pour la déconnexion
router.get('/logout', (req, res) => {
    res.clearCookie('jwtToken');
    res.json({ message: "Déconnexion réussie" });
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