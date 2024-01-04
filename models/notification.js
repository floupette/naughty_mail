const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    firm_name: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },  // Référence à l'entreprise (utilisateur) concernée
    status: { 
        type: String, 
        required: true
    },  // Statut du courrier (reçu, en attente, etc.)
    date_of_last_mail: { 
        type: Date 
    },  // Date de réception du dernier courrier
    date_of_last_pickup: { 
        type: Date 
    },  // Date du dernier retrait
    has_mail: { 
        type: Boolean, 
        default: false 
    },  // Indique si du courrier est présent
});

module.exports = mongoose.model('Notification', notificationSchema);
