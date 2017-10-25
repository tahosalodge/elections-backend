const { Router } = require('express');
const bodyParser = require('body-parser');
const Elections = require('../models/election');
const CRUD = require('../controllers/CRUDController');

const router = Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', CRUD.getAll(Elections));

router.get('/:id', CRUD.getOne(Elections));

router.post('/', CRUD.create(Elections));

router.put('/:id', CRUD.update(Elections));

router.delete('/:id', CRUD.delete(Elections));

module.exports = router;
