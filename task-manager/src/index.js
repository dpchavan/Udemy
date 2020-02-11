const app = require('./app')
var port = process.env.PORT 

app.listen(port, () => {
    console.log("Server running on port "+port);
})


