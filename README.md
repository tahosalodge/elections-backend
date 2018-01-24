# OA Elections Backend

## Scripts

* `prod` - run command for production / docker
* `debug` - node with --inspect flag
* `start` - reloading with nodemon for development
* `docker-build` - build, tag, and push docker container based on git hash
* `lint` - run eslint on src/

## Required Environment Variables

* `NODE_ENV`
* `DATABASE` - full mongo connection string
* `JWT_SECRET` - random hash for creating JWTs
* `FROM_EMAIL` - email to show as sender for notifications
* `ADMIN_EMAIL` - email for admin notifications
* `SENTRY_DSN` - connection string for sentry.io error logging
* `SLACK_URL` - slack webhook for notifications
