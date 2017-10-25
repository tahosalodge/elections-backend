const { Router } = require('express');
const bodyParser = require('body-parser');
const Unit = require('../models/unit');
const CRUD = require('../controllers/CRUDController');

const router = Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', CRUD.getAll(Unit));

router.get('/:id', CRUD.getOne(Unit));

router.post('/', CRUD.create(Unit));

router.put('/:id', CRUD.update(Unit));

router.delete('/:id', CRUD.delete(Unit));

module.exports = router;
