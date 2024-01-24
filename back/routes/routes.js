const express = require('express');
// express est un framework pour Node.js qui permet de créer des applications web
const bcrypt = require('bcrypt');
// bcrypt est un package qui permet de hasher les mots de passe
const jwt = require('jsonwebtoken');
// jsonwebtoken est un package qui permet de créer des tokens d'authentification
const User = require('../models/users'); 
// Importez le modèle User
const { authMiddleware, adminMiddleware } = require('../middlewares');
// Importez les middlewares d'authentification et d'administration
const { sendMail } = require('../mailer');
// Importez la fonction d'envoi d'email
const sendSMS = require('../sms');
// Importez la fonction d'envoi de SMS
const router = express.Router();
// Créez un routeur express


// Route pour obtenir tous les utilisateurs (admin seulement)
router.get('/users',  async (req, res) => {
    try {
       
        const users = await User.find({}).sort({firm_name: 1});
        // users est un tableau d'objets contenant tous les utilisateurs
        res.json({ message: "Utilisateurs récupérés avec succès", users , token: req.headers.authorization});
        // Renvoie un objet JSON avec un message et le tableau d'utilisateurs
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour créer un nouvel utilisateur (admin seulement)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
    console.log(req.body);
    try {
        const { firm_name, first_name, last_name, email, phone_number, password, is_admin } = req.body;
        // enregistrez tous les champs nécessaires à partir de req.body
        // c'est à dire de m'asurez que tous les champs sont bien présents dans le body
        const hashedPassword = await bcrypt.hash(password, 10);
        // await permet d'attendre que le mot de passe soit hashé
        // hash le mot de passe avant de le stocker
        const newUser = new User({
            firm_name,
            first_name,
            last_name,
            email,
            phone_number,
            password: hashedPassword,
            is_admin : is_admin === true,
            // === sert à vérifier que is_admin est bien un booléen
            last_pick_up: new Date(),
        });
        // créez un nouvel utilisateur et le sauvegarde dans la base de données
        await newUser.save();
        // await permet d'attendre que la sauvegarde soit terminée
        // si la sauvegarde échoue, une erreur sera levée et le code passera dans le bloc catch
        // si la sauvegarde réussit, le code passera à la ligne suivante
        sendMail(email, "Bienvenue", `Bienvenue sur notre plateforme. Votre mot de passe est: ${password}`);
        // envoi d'email
        res.status(201).json({ message: "Nouvel utilisateur créé avec succès", user: newUser });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// Route pour obtenir un utilisateur spécifique par son nom d'entreprise
router.get('/users/:firm_name', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ firm_name: req.params.firm_name });
        // cette ligne récupère l'utilisateur par son nom d'entreprise
        // req.params.firm_name est le nom d'entreprise passé dans l'URL
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: "Utilisateurs récupérés avec succès", user , token: req.headers.authorization});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Route pour mettre à jour un utilisateur spécifique par son nom d'entreprise (admin seulement)
router.put('/users/:firm_name', authMiddleware, adminMiddleware, async (req, res) => {
    const firmName = req.params.firm_name;
    // firmName est le nom d'entreprise passé dans l'URL
    try {
        const updatedUser = await User.findOneAndUpdate({ firm_name: firmName }, req.body, { new: true });
        // cette ligne met à jour l'utilisateur par son nom d'entreprise
        // req.body contient les champs à mettre à jour
        // { new: true } permet de renvoyer le nouvel utilisateur mis à jour
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
        // cette ligne supprime l'utilisateur par son nom d'entreprise
        // req.params.firm_name est le nom d'entreprise passé dans l'URL
        // si l'utilisateur n'existe pas, une erreur 404 est renvoyée
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
    const { firm_name, password } = req.body;
    // firm_name et password sont les champs nécessaires pour la connexion
    const user = await User.findOne({ firm_name: firm_name });
    // cette ligne récupère l'utilisateur par son nom d'entreprise

    if (user && await bcrypt.compare(password, user.password)) {
        // si l'utilisateur existe et que le mot de passe est correct
        // créez un token d'authentification
        // ce token contient l'id de l'utilisateur, son statut d'administrateur et son nom d'entreprise
        // ce token expire dans 24 heures
        // ce token est signé avec la clé secrète JWT_SECRET
        const token = jwt.sign({ userId: user._id, is_admin: user.is_admin, firm_name: user.firm_name }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('jwtToken', token, { httpOnly: true, secure: true });
        // le token est stocké dans un cookie httpOnly et sécurisé
        // le cookie est envoyé dans la réponse
        // le cookie est accessible uniquement par le serveur et non par le client
        res.json({ message: "Connexion réussie", token, user });
    } else {
        res.status(401).json({ message: 'Nom d\'entreprise ou mot de passe invalide' });
    }
});


// Route pour accuser réception du courrier
router.post('/users/:firm_name/reception', authMiddleware, async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate({ firm_name: req.params.firm_name }, { has_mail: false, last_pick_up: new Date() }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Accusé de réception du courrier effectué', user: userObject });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Route pour notifier les utilisateurs d'un nouveau courrier (admin seulement)
router.post('/notify_mail', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const firmsToNotify = req.body.firmsToNotify;
        // firmsToNotify est un tableau de noms d'entreprise
        // cela fontionne si il ya un seul ou plusieurs noms d'entreprise
        const users = await User.find({ firm_name: { $in: firmsToNotify } });

        for (const user of users) {
            // Pour chaque utilisateur, mettez à jour le statut du courrier
            await User.findOneAndUpdate({ firm_name: user.firm_name }, { has_mail: true });
        
            // Envoi d'email
            sendMail(user.email, "Nouveau Courrier", "Vous avez reçu un nouveau courrier.");
        
            // Envoi de SMS
            console.log('Numéro de téléphone de l\'utilisateur :', user.phone_number);
            await sendSMS(user.phone_number, "Vous avez reçu un nouveau courrier.");
        }

        res.json({ message: "Notifications de courrier envoyées avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'envoi des notifications de courrier." });
    }
});


// Route pour la déconnexion
router.get('/logout', (req, res) => {
    // Supprimez le cookie jwtToken
    // Le cookie est accessible dans req.cookies
    res.clearCookie('jwtToken');
    res.json({ message: "Déconnexion réussie" });
});

module.exports = router;