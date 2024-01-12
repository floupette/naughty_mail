
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
    if(!('first_name' in req.body)) return res.status(400).send('Missing "first_name" field');
    if(!('last_name' in req.body)) return res.status(400).send('Missing "last_name" field');
    if(!('email' in req.body)) return res.status(400).send('Missing "email" field');
    if(!('phone_number' in req.body)) return res.status(400).send('Missing "phone_number" field');
    if(!('password' in req.body)) return res.status(400).send('Missing "password" field');

    const { firm_name, first_name, last_name, email, phone_number, password } = req.body;

    const user = new Users();

    user.firm_name = firm_name;
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.phone_number = phone_number;
    user.password = password;

    user.last_received_mail = new Date();
    user.last_picked_up = new Date();

    user.has_mail = false;
    user.is_admin = false;

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

router.put('/:id', async (req, res) => {
    if(!('firm_name' in req.body)) return res.status(400).send('Missing "firm_name" field');
    if(!('first_name' in req.body)) return res.status(400).send('Missing "first_name" field');
    if(!('last_name' in req.body)) return res.status(400).send('Missing "last_name" field');
    if(!('email' in req.body)) return res.status(400).send('Missing "email" field');
    if(!('phone_number' in req.body)) return res.status(400).send('Missing "phone_number" field');
    if(!('password' in req.body)) return res.status(400).send('Missing "password" field');

    const user = await Users.findOne({
        where: { id: Number(req.params.id) }
    });
    if(!user) return res.sendStatus(404);
  
    user.firm_name = req.body.firm_name;
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.email = req.body.email;
    user.phone_number = req.body.phone_number;
    user.password = req.body.password;
  
    await user.save();

    res.sendStatus(200);
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