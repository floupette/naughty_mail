// mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Assurez-vous que cette ligne est présente pour utiliser les variables d'environnement

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE, // Exemple: 'gmail'
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendMail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.MAIL_FROM, // Expéditeur
        to, // Destinataire(s)
        subject, // Sujet
        text, // Corps du texte en texte brut
        // html: '<b>Hello world?</b>' // Corps du texte en HTML
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = { sendMail };
