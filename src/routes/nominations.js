const router = require('express').Router();
const bodyParser = require('body-parser');
const _ = require('lodash');
const {
  tokenMiddleware,
  adminMiddleware,
} = require('controllers/AuthController');
const NominationController = require('controllers/NominationController');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const controller = new NominationController();
const nominationFields = [
  'fname',
  'lname',
  'dob',
  'bsaid',
  'rank',
  'electionId',
  'address',
  'phone',
  'email',
  'campingLongTerm',
  'campingShortTerm',
  'chapter',
  'status',
  'type',
  'position',
];

router.get('/', tokenMiddleware, async (req, res) => {
  try {
    const { electionId } = req.query;
    let nominations = [];
    if (electionId) {
      nominations = await controller.get({ electionId });
    } else {
      nominations = await controller.get();
    }
    res.json(nominations);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.get('/:nominationId', tokenMiddleware, async (req, res) => {
  try {
    const { nominationId } = req.params;
    const nominations = await controller.getById(nominationId);
    res.json(nominations);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.post('/', tokenMiddleware, async (req, res) => {
  try {
    const toCreate = _.pick(req.body, nominationFields);
    const nomination = await controller.create(toCreate);
    res.json(nomination);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.put('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const patch = _.pick(req.body, nominationFields);
    const nomination = await controller.update(id, patch);
    res.json(nomination);
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

router.post('/export', tokenMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newOnly } = req.body;
    const nominations = await controller.generateCSV(newOnly);
    res.setHeader('Content-Type', 'text/csv');
    res.send(nominations);
  } catch (error) {
    console.log(error);
    const { message, code } = error;
    res.status(code).json({ message });
  }
});

module.exports = router;
