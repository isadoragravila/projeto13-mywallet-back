import { db, objectId } from '../databases/mongo.js'

async function validateUser(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    const session = await db.collection('sessions').findOne({ token });
    if (!session) {
        return res.status(401).send("Houve algum problema com a sua sessão. Volte à página de login");
    }

    const userId = session.userId;
    const user = await db.collection('users').findOne({ _id: new objectId(userId) });
    if (!user) {
        return res.status(401).send("Houve algum problema com a sua sessão. Volte à página de login");
    }

    delete user.password;

    res.locals.user = user;
    res.locals.token = token;

    next();
}

export default validateUser;