require('../src/db/mongoose')
const User = require('../src/model/user')

User.findByIdAndUpdate('5e088517d06e9f0182ce765f', { age : 30}).then((result) => {
    console.log(result)
    return User.countDocuments({age : 30})
}).then((count) => {
    console.log(count)
}).catch((err) => {
    console.log(err)
})