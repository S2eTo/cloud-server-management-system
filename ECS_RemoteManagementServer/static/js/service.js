const CodeRequestOk = 1000,
	CodeRequestOkButNoChange = 1003;

var Service = /** Class */ (function() {
	function Service() {
		this.status = false;
		this.host = "";
		this.port = 8888;
		this.clients = {};
		this.sendtos = [];
		this.get_status();
		this.monitor_target = null;
	}

	/**
	 * 从服务器获取状态, 同步
	 */
	Service.prototype.get_status = function() {
		request({
			url: '/get_status',
			method: "GET",
			response: function(res, status) {
				if (res.log) echo_message('', '', res.log);
				if (status) {
					// 更新页面显示
					change_status_to_go();
					// 初始化页面显示
					init_client(res.data.client, res.data.sendto);
					// 连接 socket
					socket.connect()
				}
				notification.info(res.message);
				$('#server_port').val(res.data.port);
				$('#server_host').val(res.data.host);
			}
		})
	};


	/**
	 * 更新对象信息
	 * @param {Object} data
	 * @returns {boolean}
	 */
	Service.prototype.update_status = function(data) {
		this.status = data.status;
		this.host = data.host;
		this.port = data.port;
		this.clients = data.client;
		this.sendtos = data.sendto;
		return data.status
	};

	/**
	 * 开启服务器,
	 */
	Service.prototype.run_server = function() {
		if (this.status) {
			notification.info('服务器, 已经在运行');
			echo_message(get_timer(), 'INFO', '服务器, 已经在运行');
			return false
		}
		// 先修改状态防止多次点击
		this.status = true;
		let _self = this;

		// 修改服务器状态图标
		change_status_to_wait('服务器正在准备启动...');

		// 请求接口
		request({
			url: '/run_server',
			method: 'POST',
			response: function(res, status) {
				// 如果服务器是开着的那就连接socket再将页面显示状态改成run
				if (res.code === CodeRequestOkButNoChange || res.code === CodeRequestOk) {
					// 建立 socket 连接
					socket.connect();
					// 修改服务器状态的提示
					change_status_to_go();
					try{
						let service_usage = echarts.getInstanceByDom(document.getElementById('cpu-status'));
						service_usage.resize();
					}catch (e) {}
				}

				if (res.code === CodeRequestOk) {
					notification.success(res.message)
				} else {
					notification.error(res.message)
				}
			},
		})
	};

	// 关闭服务器
	Service.prototype.stop_server = function() {
		if (!this.status) {
			notification.info('服务器没有运行');
			echo_message(get_timer(), 'INFO', '服务器, 没有运行');
			return false
		}
		let _self = this,
			clients = this.clients;

		// 更新页面显示
		change_status_to_wait('服务器正在关闭...');

		request({
			url: '/stop_server',
			method: 'POST',
			response: function(res) {
				// 更新页面显示
				if (res.code === CodeRequestOk) {
					notification.warning(res.message);
					// 关闭socket连接
					socket.close();
					// 更新页面显示
					change_status_to_stop();
					// 更新页面显示 将所有的连接对象状态改为 丢失连接
					for (let client_key in clients) {
						this_client = {};
						this_client.key = client_key;
						on_disconected(this_client, 'stop_server')
					}
				} else {
					notification.error(res.message);
				}
			}
		})
	};

	/**
	 * 添加连接对象到发送对象列表
	 *
	 * @param {string} key
	 */
	Service.prototype.append_client = function(key) {
		// 判断是否在 clients 连接对象列表中
		let appended = false;
		if (key in this.clients) {
			request({
				async: false,
				url: '/append_client',
				method: 'POST',
				data: {
					'key': key
				},
				response: function(res) {
					if (res.code === CodeRequestOk) {
						appended = true;
						notification.success(res.message);
					}else if(res.code === CodeRequestOkButNoChange) {
						appended = true;
						notification.warning(res.message);
					}else{
						notification.error(res.message);
					}
				}
			});
		} else {
			alert('没有该连接或连接已丢失.')
		}
		return appended
	};

	Service.prototype.remove_client = function(key) {
		let removed = false;
		request({
			async: false,
			url: '/remove_client',
			method: 'POST',
			data: {
				'key': key
			},
			response: function(res) {
				if (res.code === CodeRequestOk) {
					removed = true;
					notification.success(res.message);
				}else if(res.code === CodeRequestOkButNoChange) {
					removed = true;
					notification.warning(res.message);
				}else {
					notification.error(res.message);
				}
			}
		});
		return removed;
	};

	/**
	 * 与客户端断开连接
	 * @param key
	 */
	Service.prototype.disconnect_client = function(key) {
		let _self = this;
		let response = false;
		request({
			async: false,
			url: '/disconnect_client',
			method: 'POST',
			data: {
				'key': key
			},
			response: function(res) {
				response = res;
			}
		});
		return response;
	};

	/**
	 * 发送信息
	 * @param {string} msg
	 * @returns {boolean}
	 */
	Service.prototype.send = function(msg) {
		if (!msg) return false;
		if (this.sendtos.length === 0) return false;
		request({
			url: '/send',
			method: 'POST',
			data: {
				"msg": msg
			},
			response: function(res) {
				if (res.code === CodeRequestOk) $('#cmd').val('')
			}
		})
	};

	/**
	 * 设置配置
	 * @param host
	 * @param port
	 * @returns {boolean}
	 */
	Service.prototype.set_options = function(host, port) {
		if (this.host === host && this.port === port) return false;
		if (host === this.host && port === this.port) return false;

		request({
			url: '/set_options',
			method: 'POST',
			data: {
				host: host,
				port: port
			},
			response: function(res) {
				if (res.code === CodeRequestOk) {
					notification.success(res.message)
				} else {
					notification.error(res.message)
				}
			}
		})
	};

	/**
	 * 打开客户端监控
	 * @param key
	 * @returns {boolean}
	 */
	Service.prototype.monitor = function (key) {
        let successfully = false,
            _self = this;
        $.ajax({
            async:false,
            url: '/get_client_usage',
            method: 'POST',
            data: {
                client_key: key
            },
            success: function(res) {
                if (res.code === 1000){
                    successfully = true;
                    service.monitor_target = key;
                    notification.success(res.message);
                }
            },
            error: function(res) {
                res = res.responseJSON;
                if(res.code === CodeRequestOkButNoChange) {
                    successfully = true;
                    service.monitor_target = key;
                    notification.warning(res.message);
                }else {
                    notification.error(res.message);
                }
            }
        });
        return successfully;
    };

	/**
	 * 关闭监控
	 * @param key
	 */
	Service.prototype.close_monitor = function (key) {
		console.log(key);
        $.ajax({
            url: '/stop_client_usage',
            method: 'POST',
            data: {
                client_key: key
            },
        });
    };

	/**
	 * 解析ip为class名称
	 * @param key
	 * @returns {string}
	 */
	Service.prototype.parse_ip = function (key) {
        data = key.split('.');
        res = "";
        for (let i in data) res += data[i];
        res = res.split(':');
        brs = "client" + res[0] + res[1];
        return brs
    };

	return Service
}());

var service = new Service();
