const router = require('express').Router();
const bodyParser = require('body-parser');
const _ = require('lodash');
const { tokenMiddleware } = require('controllers/AuthController');
const nominationModel = require('models/nomination');
const CRUD = require('controllers/CRUDController');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const controller = new CRUD(nominationModel);
const nominationFields = [
  'fname',
  'lname',
  'dob',
  'bsaid',
  'rank',
  'election',
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
    const { electionId } = req.body;
    const nominations = await controller.get({ electionId });
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

module.exports = router;
