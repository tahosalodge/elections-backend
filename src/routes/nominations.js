const { Router } = require('express');
const bodyParser = require('body-parser');
const Nominations = require('../models/nomination');
const CRUD = require('../controllers/CRUDController');

const router = Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', CRUD.getAll(Nominations));

router.get('/:id', CRUD.getOne(Nominations));

router.post('/', CRUD.create(Nominations));

router.put('/:id', CRUD.update(Nominations));

router.delete('/:id', CRUD.delete(Nominations));

module.exports = router;
