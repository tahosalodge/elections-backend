const router = require('express').Router();
const bodyParser = require('body-parser');
const controller = require('../controllers/adminController');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/import-unit/:oldId', async (req, res) => {
  const { oldId } = req.params;
  const unit = await controller.importUnit(oldId);
  res.json(unit);
});

module.exports = router;
