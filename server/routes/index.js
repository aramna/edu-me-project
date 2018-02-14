import express from 'express'
import user from './user'

const router = express.Router()


router.use('/*', (req, res, next) => {
    res.setHeader("Expires", "-1");
    res.setHeader("Cache-Control", "must-revalidate, private");
    next();
});


router.use('/user', user)

export default router