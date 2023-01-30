import express from 'express';
import auth from './auth';
import feeds from './feeds';
import articles from './articles';

const router = express.Router();

router.use('/auth', auth);
router.use('/feeds', feeds);
router.use('/articles', articles);

export default router;
