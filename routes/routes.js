const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); 
const { authMiddleware, adminMiddleware } = require('../middlewares');
const { sendMail } = require('../mailer');
const router = express.Router();

router.get('/admin_home', authMiddleware, adminMiddleware, async (req, res) => {
    console.log("Accessing /admin_home route"); // Log pour confirmer que la route est atteinte
    try {
        const users = await User.find({});
        console.log("Users fetched: ", users); // Log pour voir les utilisateurs récupérés
        res.render('admin_home', { users }); // Assurez-vous que c'est bien 'users' ici
    } catch (err) {
        console.error("Error fetching users: ", err); // Log pour voir les erreurs
        res.status(500).send('Server error');
    }
});

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
router.post('/users/:firm_name', authMiddleware, adminMiddleware, async (req, res) => {
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

// Route pour afficher la page d'édition d'un utilisateur spécifique
router.get('/users/:firm_name/edit', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const firmName = req.params.firm_name;
        const user = await User.findOne({ firm_name: firmName });
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        res.render('edit', { user }); // Rendu de la page d'édition avec les détails de l'utilisateur
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});


router.delete('/users/:firm_name', authMiddleware, adminMiddleware, (req, res) => {
    User.findOneAndDelete({ firm_name: req.params.firm_name })
    .then(user => {
        if (!user) {
            // Si aucun utilisateur n'est trouvé, renvoyez une réponse d'erreur ou redirigez vers une page d'erreur.
            return res.status(404).send('User not found');
        } else {
            // Si l'utilisateur est supprimé avec succès, redirigez vers la page d'accueil de l'admin ou affichez un message de succès.
            // Remplacez '/admin_home' par l'URL vers laquelle vous souhaitez rediriger.
            res.redirect('/admin_home');
        }
    })
    .catch(err => {
        console.error(err);
        // Gérer les erreurs ici, peut-être rediriger vers une page d'erreur ou afficher un message.
        res.status(500).send('Server error');
    });
});



router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id, is_admin: user.is_admin, firm_name: user.firm_name }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Définir le token dans un cookie
        res.cookie('jwtToken', token, { httpOnly: true, secure: true });

        // Vérifier si l'utilisateur est un administrateur ou une entreprise
        if (user.is_admin) {
            // Rediriger les administrateurs vers une page d'administration
            res.redirect('/admin_home');
        } else {
            // Rediriger les entreprises vers la page user_home
            res.redirect(`/users/${user.firm_name}/user_home`);
        }
    } else {
        res.status(401).send('Invalid email or password');
    }
});

// Route GET pour afficher la page user_home pour une entreprise spécifique
router.get('/users/:firm_name/user_home', authMiddleware, async (req, res) => {
    const firmName = req.params.firm_name;

    try {
        const user = await User.findOne({ firm_name: firmName });
        if (!user) {
            res.status(404).send('User not found');
        } else {
            res.render('user_home', { user: user });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



// Route pour accuser réception du courrier
router.post('/users/:firm_name/reception', authMiddleware, (req, res) => {
    const firmName = req.params.firm_name;

    User.findOneAndUpdate({ firm_name: firmName }, { has_mail: false, last_pick_up: new Date() }, { new: true })
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Mail pick up acknowledged', user });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: err.message });
    });
});


// Route pour notifier les utilisateurs d'un nouveau courrier (admin seulement)
router.post('/notify_mail', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const firmsToNotify = req.body.firmsToNotify; // Récupère les noms des entreprises du formulaire

        // Mettre à jour le statut du courrier pour chaque entreprise et envoyer un e-mail
        const users = await User.find({ firm_name: { $in: firmsToNotify } });
        users.forEach(async (user) => {
            await User.findOneAndUpdate({ firm_name: user.firm_name }, { has_mail: true });

            // Envoyez un e-mail de notification
            sendMail(user.email, "Nouveau Courrier", "Vous avez reçu un nouveau courrier.");
        });

        res.redirect('/admin_home'); // Redirige vers la page d'accueil de l'admin après l'opération
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'envoi des notifications de courrier." });
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