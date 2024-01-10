
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

router.post('/', async (req,res) => {
    if(!('firm_name' in req.body)) return res.status(400).send('Missing "firm_name" field');

    const { firm_name } = req.body;

    const user = new Users();

    user.firm_name = firm_name;

    await user.save();

    res.sendStatus(201);
});

router.get('/:id', async (req, res) => {
    const user = await Users.findOne({
        where: { id: Number(req.params.id) }
    });
    if(!user) return res.sendStatus(404);
    res.send(user);
});

router.delete('/:id', async (req, res) => {
    const user = await Users.findOne({
        where: { id: Number(req.params.id) }
    });
    if(!user) return res.sendStatus(404);
    await user.remove();
    res.sendStatus(200);
});

export default router;