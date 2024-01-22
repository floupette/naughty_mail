import { Router } from "express";
import Users from "../entities/Users";
import { getUserByToken } from "../utils/AuthUtils";

const router = Router();

router.get('/', async (req, res) => {
    if (!req.cookies.token) return res.sendStatus(500);
    const user = await getUserByToken(req.cookies.token);
    if (!user) return res.sendStatus(500);
    res.send(user);
});

export default router;