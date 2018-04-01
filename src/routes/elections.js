const router = require('express').Router();
const bodyParser = require('body-parser');
const _ = require('lodash');
const ElectionController = require('controllers/ElectionController');
const { tokenMiddleware, getUser } = require('controllers/AuthController');

const controller = new ElectionController();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', tokenMiddleware, async (req, res) => {
  try {
    const { userId, userCap } = req;
    let elections = [];
    if (userCap === 'unit') {
      const { unit: unitId } = await getUser(userId);
      elections = await controller.get({ unitId });
    } else {
      elections = await controller.get();
    }
    res.json(elections);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.get('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const election = await controller.getById(id);
    res.json(election);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.post('/', tokenMiddleware, async (req, res) => {
  try {
    const data = _.pick(req.body, [
      'unitId',
      'requestedDates',
      'status',
      'season',
      'chapter',
    ]);
    const election = await controller.create(data);
    res.json(election);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.put('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { userCap } = req;
    const patch = _.pick(req.body, [
      'unit',
      'requestedDates',
      'status',
      'season',
      'date',
    ]);
    if (userCap === 'unit') {
      patch.status = 'Modified by Unit';
    } else {
      patch.status = 'Scheduled';
    }
    const election = await controller.update(id, patch);
    res.json(election);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.put('/:id/report', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const patch = _.pick(req.body, [
      'candidates',
      'youthAttendance',
      'election1Ballots',
      'election2Ballots',
      'status',
    ]);
    const { election, candidates } = await controller.report(id, patch);
    res.json({ election, candidates });
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.delete('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await controller.remove(id);
    res.json({ message: 'Deleted successfully.' });
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

module.exports = router;
