const router = require('express').Router();
const bodyParser = require('body-parser');
const ElectionController = require('controllers/ElectionController');
const AuthController = require('controllers/AuthController');

const controller = new ElectionController();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', AuthController.tokenMiddleware, async (req, res) => {
  try {
    const elections = await controller.get();
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
      unit, requestedDates, status, season,
    } = req.body;
    const election = await controller.create({
      unit,
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
    const {
      unit, requestedDates, status, season,
    } = req.body;
    const election = await controller.update(id, {
      unit,
      requestedDates,
      status,
      season,
    });
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
