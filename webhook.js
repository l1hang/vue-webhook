let http = require('http')
let crypto = require('crypto')
let  {spawn} = require('child_process')
let SECRET  = '123456'
let sendMail = require('./sendMail')
function sign(body) {
    return  `sha1=` + crypto.createHmac('sha1',SECRET).update(body).digest('hex')
}
let server = http.createServer(function (req, res) {
    console.log(req.method,req.url);
    if(req.method == 'POST' && req.url == '/webhook'){
        let buffers = []
        req.on('data',function(buffer){
            buffers.push(buffer)
        })
        req.on('end',function(){
        let body = Buffer.concat(buffers)
        let event = req.headers['x-gitlab-event'] 
        //github 请求来的时候，要传递请求体body，另外还会传一个signature过来，你需要验证签名对不对
        let signature = req.headers['x-hub-signature']
        if(signature !== sign(body)){
            res.end('Not Allowed')
        }
        res.setHeader('Content-Type','application/json')
        res.end(JSON.stringify({ok:true}))
        if(event == 'push') {  //开始部署
            let payload = JSON.parse(body)
            spawn('sh',[`./${payload.repository.name}.sh`]) //子进程进行部署
            let buffers = []  //部署的时候，会把子进程的输出捕获下来，输出到浏览器上
            //子进程的输出对象stdout来触发on('data')事件，拿到子进程的输出
            child.stdout.on('data',function(buffer){
                buffers.push(buffer)//把子进程的输出放到数组中
            })
            //子进程的输出对象stdout来触发on('end')事件，拿到子进程的输出
            child.stdout.on('end',function(buffer){
                let log = Buffer.concat(buffers).toString()//把子进程的输出拼接起来
                console.log(log)
                sendMail(`
                <h1>部署日期：${new Date()}</h1>
                <h2>部署人：${payload.pusher.name}</h2>
                <h2>部署邮箱：${payload.pusher.email}</h2>
                <h2>提交信息：${payload.head_commit&&payload.head_commit['message']}</h2>
                <h2>布署日志：${log.replace("\r\n",'<br/>')}</h2>
                `)
            })
        }
    })
    }else {
        res.end('Not Found')
    }
    })
server.listen(4000,() =>{
    console.log('server is running on port 4000')
})