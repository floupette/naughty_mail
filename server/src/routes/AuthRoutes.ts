import { Router } from "express";
import Users from "../entities/Users";
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
    const { firm_name, password } = req.body;
    const user = await Users.findOne({
        where: {
            firm_name: firm_name,
            password: password
        }
    })
    if(!user) return res.sendStatus(403);

    const token = jwt.sign({
        id: user.id
    }, 'poule');
    res.cookie('token', token);
    res.send('authentificated');
});

export default router;