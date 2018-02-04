const router = require('express').Router();
const bodyParser = require('body-parser');
const _ = require('lodash');
const { tokenMiddleware } = require('controllers/AuthController');
const candidateModel = require('models/candidate');
const CRUD = require('controllers/CRUDController');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const controller = new CRUD(candidateModel);
const candidateFields = [
  'fname',
  'lname',
  'dob',
  'bsaid',
  'rank',
  'election',
  'address',
  'parentPhone',
  'parentEmail',
  'youthPhone',
  'youthEmail',
  'campingLongTerm',
  'campingShortTerm',
  'chapter',
  'status',
];

router.get('/', tokenMiddleware, async (req, res) => {
  try {
    const { electionId } = req.body;
    const candidates = await controller.get({ electionId });
    res.json(candidates);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.post('/', tokenMiddleware, async (req, res) => {
  try {
    const toCreate = _.pick(req.body, candidateFields);
    const candidate = await controller.create(toCreate);
    res.json(candidate);
  } catch ({ code, message }) {
    res.status(code).json({ message });
  }
});

router.put('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const patch = _.pick(req.body, candidateFields);
    const candidate = await controller.update(id, patch);
    res.json(candidate);
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
