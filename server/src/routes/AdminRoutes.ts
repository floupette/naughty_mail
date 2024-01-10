
// create_user
// get_user
// update_user
// delete_user
// Nom des routes n'est pas leur chemin, pour leurs chemin, se référer a My Human Pets
import { Router } from "express";
import Users from "../entities/Users";

const router = Router();

router.get('/', async (req, res) => {
    res.send(await Users.find());
});