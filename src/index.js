require('dotenv').config({ path: '.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Raven = require('raven');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');

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
app.use(morgan('dev'));

app.use(Raven.requestHandler());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(cors());
app.get('/api', (req, res) => res.json({ message: 'Hello world!' }));
app.use('/api/candidates', candidateRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/nominations', nominationRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(Raven.errorHandler());
  process.on('unhandledRejection', error => Raven.captureException(error));
} else {
  process.on('unhandledRejection', error => console.error(error));
}

app.listen(app.get('port'));
