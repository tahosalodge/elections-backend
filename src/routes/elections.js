const router = require('express').Router();
const bodyParser = require('body-parser');
const _ = require('lodash');
const ElectionController = require('controllers/ElectionController');
const AuthController = require('controllers/authController');

const controller = new ElectionController();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { userId, userCap } = req;
    let elections = [];
    if (userCap === 'unit') {
      const { unit: unitId } = await AuthController.getUser(userId);
      elections = await controller.get({ unitId });
    } else {
      elections = await controller.get();
    }
    res.json(elections);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.get('/:id', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const election = await controller.getById(id);
    res.json(election);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.post('/', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const {
      unitId, requestedDates, status, season,
    } = req.body;
    const election = await controller.create({
      unitId,
      requestedDates,
      status,
      season,
    });
    res.json(election);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.put('/:id', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { userCap } = req;
    const patch = _.pick(req.body, ['unit', 'requestedDates', 'status', 'season', 'date']);
    if (userCap === 'unit') {
      patch.status = 'Modified by Unit';
    } else if (userCap === 'chapter') {
      patch.status = 'Scheduled';
    }
    const election = await controller.update(id, patch);
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
