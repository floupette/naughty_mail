import Users from "../entities/Users";
import jwt from 'jsonwebtoken';

export async function getUserByToken(token: string): Promise<Users | null> {
    try {
        const decodedToken = jwt.verify(token, 'poule') as { id: number };
        const userId = decodedToken.id;
        if (!userId) return null;
        const user = await Users.findOne({
            where: { id: userId }
        });
        if (!user) return null;
        return user;
    } catch(err) {
        // Erreur le token n'a pas pu être décoder
        return null;
    }
}
