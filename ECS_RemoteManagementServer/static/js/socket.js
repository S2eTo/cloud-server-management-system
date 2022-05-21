var Socket = /** Class */ (function() {
	/**
	 * 初始化参数
	 * @constructor
	 */
	function Socket() {
		this.namespace = '/channel';
		this.socket = ""
	}

	/**
	 * 连接socket
	 */
	Socket.prototype.connect = function() {
		let _self = this;
		this.socket = io.connect(_self.namespace, {
			'reconnect': true
		});
		this.socket.on('server_response', function(res) {
			_self.on_response(res)
		});

		// 如果连接错误就关闭连接
		this.socket.on('error', function(data) {
			_self.close()
		});
	};

	/**
	 * 有返回信息时, 不同的返回类型, 交给不同的函数处理
	 * @param res
	 */
	Socket.prototype.on_response = function(res) {
		if (res.action === "usage_action") {
			update_mychart(res);
		} else if (res.action === "on_connect") {
			on_connect(res)
		} else if (res.action === "on_recv") {
			echo_message(res.data.t, res.data.key, res.data.msg)
		} else if (res.action === "on_disconected") {
			on_disconected(res)
		} else if (res.action === "client_usage") {
			client_usage(res)
		} else if (res.action === "file_distribute") {
			window.file_distribute(res.data)
		}else if (res.action === "danger_data_packet") {
			window.danger_data_packet(res.data)
		}
	};

	/**
	 * 关闭连接
	 */
	Socket.prototype.close = function() {
		this.socket.disconnect()
	};

	return Socket
}());

var socket = new Socket();
