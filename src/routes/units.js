const { Router } = require('express');
const bodyParser = require('body-parser');
const Unit = require('../models/unit');
const CRUD = require('../controllers/CRUDController');
const UnitController = require('../controllers/UnitController');
const { verifyToken } = require('../controllers/authController');

const router = Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', verifyToken, UnitController.getAll);

router.get('/:id', verifyToken, CRUD.getOne(Unit));

router.post('/', verifyToken, async (req, res) => {
  const { userCap, userId, body } = req;
  try {
    const unit = await UnitController.create(body, userCap, userId);
    res.json(unit);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.put('/:id', verifyToken, CRUD.update(Unit));

router.delete('/:id', verifyToken, CRUD.delete(Unit));

module.exports = router;
