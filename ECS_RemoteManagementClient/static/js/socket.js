var Socket = /** Class */ (function () {
    /**
     * 初始化参数
     * @constructor
     */
    function Socket () {
        this.namespace = '/channel';
        this.socket = ""
    }

    /**
     * 连接socket
     */
    Socket.prototype.connect = function () {
        let _self = this;
        this.socket = io.connect(_self.namespace, { 'reconnect': true });
        this.socket.on('server_response', function(res) {
            _self.on_response(res)
        });

        // 如果连接错误就关闭连接
        this.socket.on('error', function(data){
            _self.close()
        });
    };

    /**
     * 有返回信息时, 不同的返回类型, 交给不同的函数处理
     * @param res
     */
    Socket.prototype.on_response = function (res) {
        if(res.action === "disconnect") {
            disconnect(res);
        }else if(res.action === "on_recv") {
            echo_message( res.data.t, res.data.key, res.data.msg)
        }else if(res.action === "exec_command") {
            echo_message(res.data.t, res.data.key, res.data.msg)
        }else if(res.action === "on_traffic_packet") {
            console.log('on_traffic_packet')
            console.log(res)
        }
    };

    /**
     * 关闭连接
     */
    Socket.prototype.close = function () {
        this.socket.disconnect()
    };

    return Socket
}());

var socket = new Socket();

// Microsoft Windows [版本 10.0.18362.53]
// (c) 2019 Microsoft Corporation。保留所有权利。

console.log("这是我的个人作品哦, 你可以通过 https://space.bilibili.com/274407612 找到我");