const request = require('request');
// request est une bibliothèque qui permet d'envoyer des requêtes HTTP
// c'est utile pour envoyer des SMS

const apiKey = process.env.API_KEY;
const sender = process.env.SENDER;

async function sendSMS(to, message) {
    // Fonction qui permet d'envoyer un SMS
    if (!to || !message) {
        // Si le numéro de téléphone ou le message n'est pas fourni
        // On affiche une erreur dans la console
        console.error('Numéro de téléphone et message sont requis');
        return;
    }

    const phoneNumber = to.toString().startsWith('0') ? `+33${to.toString().substring(1)}` : `+${to.toString()}`;
    // On formate le numéro de téléphone pour qu'il soit au format international
    // Si le numéro de téléphone commence par 0, on le remplace par +33
    // Sinon, on ajoute + devant le numéro de téléphone

    const options = {
        method: 'POST',
        url: 'https://api.allmysms.com/sms/send',
        headers: {
            'cache-control': 'no-cache',
            'Authorization': `Basic ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: {
            from: sender,
            to: phoneNumber,
            text: message,
            date: new Date().toISOString()
        },
        json: true
    };

    request(options, function (error, response, body) {
        // On envoie la requête HTTP
        // Si la requête HTTP échoue, on affiche une erreur dans la console
        // Si la requête HTTP réussit, on affiche la réponse dans la console
        // La réponse contient le statut de la requête HTTP et le message envoyé
        // Si le statut est différent de 100, cela signifie que la requête HTTP a échoué
        if (error) {
            console.error('Erreur lors de l\'envoi du SMS :', error);
            return;
        }

        if (body.status !== 100) {
            console.error(`Erreur lors de l'envoi du SMS : ${body.status} - Réponse complète : ${JSON.stringify(body)}`);
            return;
        }

        console.log('SMS envoyé avec succès :', body);
    });
}

module.exports = sendSMS;