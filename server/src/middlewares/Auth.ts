import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import Users from "../entities/Users";

export async function userConnected( req: Request, res: Response, next: NextFunction ){
    /*
    -récuperer le token depuis les cookie, vérifier qu'il existe
    -récuperer les données stocker dans le token
    -récuperer l'utilisateur via l'id récuperer dans le cookie
    
    401*/
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    try {
        const decodedToken = jwt.verify(token, 'poule') as { id: number };
        const userId = decodedToken.id;
        if (!userId) return res.sendStatus(401);
        const user = await Users.findOne({
            where: { id: userId }
        });
        if (!user) return res.sendStatus(401);
        if (user.is_admin) return res.sendStatus(401);
        next();
    } catch(err) {
        // Erreur le token n'a pas pu être décoder
        return res.sendStatus(401);
    }
}


export async function adminConnected( req: Request, res: Response, next: NextFunction ){

    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    try {
        const decodedToken = jwt.verify(token, 'poule') as { id: number };
        const userId = decodedToken.id;
        if (!userId) return res.sendStatus(401);
        const user = await Users.findOne({
            where: { id: userId }
        });
        if (!user) return res.sendStatus(401);
        if (!user.is_admin) return res.sendStatus(401);
        next();
    } catch(err) {
        // Erreur le token n'a pas pu être décoder
        return res.sendStatus(401);
    }
}