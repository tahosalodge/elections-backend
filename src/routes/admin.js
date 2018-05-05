const router = require('express').Router();
const bodyParser = require('body-parser');
const AdminController = require('controllers/AdminController');
const {
  tokenMiddleware,
  adminMiddleware,
} = require('controllers/AuthController');

const admin = new AdminController();

router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(bodyParser.json());

router.post(
  '/import-unit/:oldId',
  tokenMiddleware,
  adminMiddleware,
  async (req, res) => {
    const {
      oldId
    } = req.params;
    try {
      const unit = await admin.importUnit(oldId);
      res.json(unit);
    } catch ({
      message,
      code
    }) {
      res.status(code || 500).json(message);
    }
  }
);

router.post(
  '/linkUsersToUnits',
  tokenMiddleware,
  adminMiddleware,
  async (req, res) => {
    const {
      dryRun
    } = req.body;
    try {
      const users = await admin.linkUsersToUnits(dryRun);
      res.json(users);
    } catch ({
      message,
      code
    }) {
      res.status(500).json(message);
    }
  }
);

router.post(
  '/linkElectionToChapter',
  tokenMiddleware,
  adminMiddleware,
  async (req, res) => {
    const {
      dryRun
    } = req.body;
    try {
      const elections = await admin.linkElectionToChapter(dryRun);
      res.json(elections);
    } catch ({
      message,
      code
    }) {
      res.status(500).json(message);
    }
  }
);

router.post(
  '/create-user',
  tokenMiddleware,
  adminMiddleware,
  async (req, res) => {
    const {
      fname,
      lname,
      email,
      chapter,
      capability
    } = req.body;
    try {
      await admin.createUser({
        fname,
        lname,
        email,
        chapter,
        capability,
      });
      res.json({
        email
      });
    } catch ({
      message,
      code
    }) {
      res.status(500).json(message);
    }
  }
);

router.post(
  '/candidate-import',
  tokenMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        candidateCsv
      } = req.files;
      const {
        electionId,
      } = req.body;
      const candidates = await admin.candidateImport(
        candidateCsv,
        electionId,
      );
      res.json({
        message: `Imported ${candidates.length} candidates.`
      });
    } catch ({
      message,
      code
    }) {
      res.status(code).json(message);
    }
  }
);

module.exports = router;