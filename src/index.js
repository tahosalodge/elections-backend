require('dotenv').config({ path: '.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Raven = require('raven');
const candidateRoutes = require('routes/candidates');
const electionRoutes = require('routes/elections');
const nominationRoutes = require('routes/nominations');
const unitRoutes = require('routes/units');
const authRoutes = require('routes/auth');
const adminRoutes = require('routes/admin');

const app = express();

Raven.config(process.env.SENTRY_DSN).install();
app.set('port', process.env.PORT || 4001);
app.set('router', express.Router);

app.use(Raven.requestHandler());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(cors());
app.get('/', (req, res) => res.send('Hello world!'));
app.use('/candidates', candidateRoutes);
app.use('/elections', electionRoutes);
app.use('/nominations', nominationRoutes);
app.use('/units', unitRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.use(Raven.errorHandler());

process.on('unhandledRejection', error => Raven.captureException(error));

app.listen(app.get('port'));
