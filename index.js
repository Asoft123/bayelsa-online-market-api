const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;
const server = http.createServer(app)


server.listen(port, (err, success) => {
    if (err) throw err
    console.log('Server Running on' + " " + port)
})