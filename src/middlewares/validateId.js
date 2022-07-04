import { db, objectId } from '../databases/mongo.js';

async function validateId(req, res, next) {
    const id = req.params.id;

    const user = res.locals.user;
    const registerId = await db.collection('transactions').findOne({ _id: new objectId(id), userId: new objectId(user._id) });

    if (!registerId) {
        return res.status(404).send("Registro não encontrado");
    }
    next();
}

export default validateId;