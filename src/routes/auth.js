const router = require('express').Router();
const bodyParser = require('body-parser');
const AuthController = require('controllers/AuthController');

const { tokenMiddleware, adminMiddleware } = AuthController;
const controller = new AuthController();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await controller.login(email, password);
    res.json(authData);
  } catch (error) {
    const { code, message } = error;
    res.status(code).json({ message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, fname, lname, chapter, password, capability } = req.body;
    const userInfo = {
      email,
      fname,
      lname,
      chapter,
      password,
      capability,
    };
    const authInfo = await controller.register(userInfo);
    res.json(authInfo);
  } catch ({ code, message }) {
    res.status(500).json({ message });
  }
});

router.get('/me', tokenMiddleware, async (req, res) => {
  try {
    const user = await controller.me(req.userId);
    res.send(user);
  } catch ({ message }) {
    res.status(401).json({ message });
  }
});

router.post('/resetPassword', async (req, res) => {
  try {
    const { email } = req.body;
    await controller.resetPassword(email);
    res.send(
      `Password reset successfully, a new password has been emailed to you at ${email}`
    );
  } catch ({ message }) {
    res.status(401).json({ message });
  }
});

router.get('/users', tokenMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await controller.getUsers();
    res.send(users);
  } catch ({ message }) {
    res.status(401).json({ message });
  }
});

module.exports = router;
