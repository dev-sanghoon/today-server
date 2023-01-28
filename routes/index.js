const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/feeds', require('./feeds'));
router.use('/articles', require('./articles'));

module.exports = router;
