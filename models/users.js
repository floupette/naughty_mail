const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firm_name: { type: String, required: true, unique: true }, // Nom de l'entreprise
  first_name: { type: String, required: true, maxlength: 25 }, // Prénom de l'utilisateur
  last_name: { type: String, required: true, maxlength: 25 }, // Nom de l'utilisateur
  email: { type: String, required: true, unique: true, maxlength: 50 }, // Adresse e-mail
  phone_number: { type: Number, required: true, maxlength: 25 }, // Numéro de téléphone
  password: { type: String, required: true, maxlength: 100 }, // Mot de passe
  last_received_mail: { type: Date }, // Date de réception du dernier courrier
  last_pick_up: { type: Date }, // Date du dernier retrait
  has_mail: { type: Boolean, default: false }, // Statut du courrier
  is_admin: { type: Boolean, default: false } // Indique si l'utilisateur est un administrateur
});

module.exports = mongoose.model('User', userSchema);

