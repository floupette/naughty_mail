
const nodemailer = require('nodemailer');
// nodemailer est une bibliothèque qui permet d'envoyer des emails
require('dotenv').config(); 
// dotenv permet de récupérer les variables d'environnement du fichier .env

const transporter = nodemailer.createTransport({
    // Création d'un transporteur SMTP réutilisable
    // SMTP (Simple Mail Transfer Protocol) est un protocole de communication qui permet d'envoyer des emails
    service: process.env.MAIL_SERVICE, 
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendMail = (to, subject, text) => {
    // cette const permet d'envoyer un email
    const mailOptions = {
        from: process.env.MAIL_FROM, // Expéditeur
        to, // Destinataire(s)
        subject, // Sujet
        text, // Corps du texte en texte brut
        // html: '<b>Hello world?</b>' // Corps du texte en HTML
    };

    transporter.sendMail(mailOptions, function(error, info){
        // le transporteur SMTP envoie l'email
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = { sendMail };
