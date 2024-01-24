const jwt = require('jsonwebtoken');

// Middleware pour authentifier les jetons JWT
const authMiddleware = (req, res, next) => {
    console.log('Cookies: ', req.cookies); // Log pour voir tous les cookies

    // Essayer d'obtenir le token de l'en-tête 'Authorization'
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1];  

    // Si le token n'est pas dans l'en-tête, essayer de l'obtenir des cookies
    if (!token) {
        console.log('Recherche du token dans les cookies...');
        token = req.cookies.jwtToken;
    }

    console.log('Token: ', token);  // Log pour voir le token extrait

    if (!token) {
        return res.status(403).json({ message: "Aucun token fourni, accès refusé." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erreur de vérification JWT: ', err);  // Log pour voir l'erreur de vérification
            return res.status(403).json({ message: "Token invalide ou expiré." });
        }
        console.log('Utilisateur JWT: ', user);  // Log pour voir les données de l'utilisateur extraites du token
        req.user = user;  // Attacher les infos utilisateur à l'objet req pour les middlewares suivants
        next();
    });
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: "Accès refusé, droits administrateur requis." });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
