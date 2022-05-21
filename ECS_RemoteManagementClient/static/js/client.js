var Client  = (function () {
    function Client() {
        /**
         * 目标地址
         * @type {string}
         */
        this.target = '127.0.0.1';

        /**
         * 目标端口
         * @type {number}
         */
        this.port = 8888;

        /**
         * 当前连接状态
         * @type {boolean}
         */
        this.status = false;

        this.get_status();
    }

    /**
     * 从后端获取客户端状态
     */
    Client.prototype.get_status = function () {
        request({
            url: '/get_status',
            method: "GET",
            response: function (res, status) {
                if (res.log)  echo_message('','', res.log);
                init_status();
                // 如果是建立了连接的连接 websocket
                console.log(status);
                if (status) socket.connect()
            }
        })
    };

    /**
     *
     */
    Client.prototype.connect = function () {
        // 如果已经建立连接就不要连接
        if (this.status) return false;

        // 修改页面上的状态
        change_status_to_wait('正在连接, 请稍后...');

        // 现在设置为true, 防止多次点击
        this.status = true;

        notification.info('正在连接, 请稍后...');

        /**
         *
         * @type {Client}
         * @private
         */
        let _self = this;

        request({
            url: '/connect',
            method: "POST",
            response: function (res, status) {
                if(res.code === 1000) {
                    // 显示通知
                    notification.success(res.message);

                    // 连接socket
                    socket.connect();

                    // 连接成功, 修改页面上显示的状态
                    change_status_to_go('连接正常...')


                }else {

                    //
                    change_status_to_stop('没有连接...');

                    _self.status = false;
                    notification.error(res.message);
                }
            }
        })
    };

    /**
     * 更新/设置对象信息
     * @param {Object} res
     */
    Client.prototype.update_status = function (res) {
        this.target = res.target;
        this.port = res.port;
        this.status = res.status;
        return res.status;
    };

    /**
     * 断开连接
     */
    Client.prototype.disconnect = function () {

        change_status_to_stop('正在断开连接...');
        /**
         *
         * @type {Client}
         * @private
         */
        let _self = this;

        request({
            url: '/disconnect',
            method: 'POST',
            response: function (res, status) {
                if(res.code === 1000) {
                    notification.success(res.message);
                }else if (res.code === 1003) {
                    _self.status = false;
                    notification.warning(res.message);
                }else {
                    _self.status = false;
                    notification.error(res.message);
                }

                // 断开连接之后无论有没有成功断开 socket
                try {
                    socket.close();
                }catch (e) {

                }
                change_status_to_stop('没有连接...');
            }
        })
    };

    /**
     *
     * @param {String} target
     * @param {String} port
     * @returns {boolean}
     */
    Client.prototype.set_options = function (target, port ) {
        if (this.host === target && this.port === port) return false;
        /**
         *
         * @type {Client}
         * @private
         */
        let _self = this;

        request({
            url: '/set_options',
            method: "POST",
            data: {target: target, port: port},
            response: function (res, status) {
                if(res.code === 1000) {
                    notification.success(res.message);
                }else {
                    _self.status = false;
                    notification.error(res.message);
                }
            }
        })
    };

    return Client;
}());

let client = new Client();