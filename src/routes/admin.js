const router = require('express').Router();
const bodyParser = require('body-parser');
const AdminController = require('controllers/AdminController');
const AuthController = require('controllers/AuthController');

const controller = new AdminController();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/import-unit/:oldId', AuthController.tokenMiddleware, async (req, res) => {
  const { oldId } = req.params;
  try {
    const unit = await controller.importUnit(oldId);
    res.json(unit);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

module.exports = router;
