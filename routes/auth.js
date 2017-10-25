const { Router } = require('express');
const bodyParser = require('body-parser');
const AuthController = require('../controllers/authController');

const router = Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', AuthController.verifyToken, AuthController.me);

module.exports = router;
