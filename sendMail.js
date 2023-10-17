const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service:'qq',//使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
        user: '83687401@qq.com',
        // 这里密码不是qq密码，是你设置的smtp授权码
        pass: 'zjyvqkzjyvqkbfjc',
    }
})
function sendMail(message){
    let mailOptions = {
        from:'"83687401" <83687401@qq.com>', // 发送者
        to: '83687401@qq.com', // 接受者,可以同时发送多个,以逗号隔开
        subject: '部署通知', // 标题
        html: message // html 内容
    };
    //send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }else{
            console.log('Message sent: %s', info.messageId);
        }
    });

}
module.exports = sendMail;