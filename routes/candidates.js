const { Router } = require('express');
const bodyParser = require('body-parser');
const Candidates = require('../models/candidate');
const CRUD = require('../controllers/CRUDController');

const router = Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', CRUD.getAll(Candidates));

router.get('/:id', CRUD.getOne(Candidates));

router.post('/', CRUD.create(Candidates));

router.put('/:id', CRUD.update(Candidates));

router.delete('/:id', CRUD.delete(Candidates));

module.exports = router;
