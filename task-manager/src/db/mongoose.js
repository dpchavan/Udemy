const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology: true,
    useFindAndModify : false
}).then(() => {
    console.log("Connected to DB success !!!")
}).catch((err) => {
    console.log("Error while connecting DB ",err)
})


