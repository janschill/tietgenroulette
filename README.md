# Tietgenroulette

Video chat for those desperate lonely isolation times.

## Getting started

1. Clone this repository
2. Make sure nodejs is installed
3. Install all dependencies by running `npm install`
4. Change socket.io connection in `master.js` to `localhost`
5. Start server `node server.js`

## pm2

“PM2 is a daemon process manager that will help you manage and keep your application online 24/7”

It can be used to easily run a nodejs application on a server. It makes sure that the application keeps running or gets restarted when it crashes.

```bash
pm2 logs
```
