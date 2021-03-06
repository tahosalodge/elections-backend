const router = require('express').Router();
const bodyParser = require('body-parser');
const UnitController = require('controllers/UnitController');
const AuthController = require('controllers/AuthController');

const controller = new UnitController();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { userId, userCap } = req;
    let units = [];
    if (userCap === 'unit') {
      units = await controller.get({}, ['number', 'chapter', 'unitLeader']);
    } else if (userCap === 'chapter') {
      const user = await AuthController.getUser(userId);
      units = await controller.get({ chapter: user.chapter });
    } else {
      units = await controller.get();
    }
    res.json(units);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.get('/:id', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const election = await controller.getById(id);
    res.json(election);
  } catch (error) {
    const { code, message } = error;
    res.status(code).json({ message });
  }
});

router.post('/', AuthController.tokenMiddleware, async (req, res) => {
  const { body, userCap, userId } = req;
  try {
    const unit = await controller.create(body, userCap, userId);
    res.json(unit);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.put('/:id', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const election = await controller.update(id, req.body);
    res.json(election);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.delete('/:id', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await controller.remove(id);
    res.json({ message: 'Deleted successfully.' });
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

module.exports = router;
