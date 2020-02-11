const sgMail = require('@sendgrid/mail')
const sendGridApiKey = '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'

sgMail.setApiKey(sendGridApiKey)

const sendWelcomeEmail = function (email, name){
    sgMail.send({
        to : email,
        from : 'dattaprasadchavan1111@gmail.com',
        subject : 'Thanks for joining in',
        text : `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}
const sendCancelationEmail = function(email, name){
    sgMail.send({
        to : email,
        from : 'dattaprasadchavan1111@gmail.com',
        subject : 'Sorry to see you go!!',
        text : `Goodbye, ${name}. I hope to see you back sometime soon`
    })
}
module.exports = {sendWelcomeEmail, sendCancelationEmail}

