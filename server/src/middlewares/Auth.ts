import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import Users from "../entities/Users";
import { getUserByToken } from "../utils/AuthUtils";

export async function userConnected(req: Request, res: Response, next: NextFunction) {
    /*
    -récuperer le token depuis les cookie, vérifier qu'il existe
    -récuperer les données stocker dans le token
    -récuperer l'utilisateur via l'id récuperer dans le cookie
    
    401*/
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);
    const user = await getUserByToken(token);
    if (!user) return res.sendStatus(401);
    if (user.is_admin) return res.sendStatus(401);
    next();
}


export async function adminConnected(req: Request, res: Response, next: NextFunction) {

    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);
    const user = await getUserByToken(token);
    if (!user) return res.sendStatus(401);
    if (!user.is_admin) return res.sendStatus(401);
    next();
}