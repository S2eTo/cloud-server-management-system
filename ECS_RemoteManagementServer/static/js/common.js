/**
 * 公共函数, 把连接对象显示在页面中
 *
 * @param {string} ip_port_class
 * @param {{string}} client
 * @returns {boolean}
 */
function add_client_to_page(ip_port_class, client) {
	ele = '<li class="client-item add ' + ip_port_class + '"><div class="client_info"><img src="../static/img/LogoTiny.png" alt="" srcset="">';
	ele += '<span class="client-item-info">';
	ele += '<div class="target">' + client.host + '</div>';
	ele += '<div class="os">Os: ' + client.os + '</div>';
	ele += '<div class="user">User: ' + client.user + '</div>';
	ele += '</span></div>';
	ele += '</li>';

	// 将客户端信息添加到页面中
	let $this = $(ele);
	$this.appendTo($('.client-list ul'));

	let ccp = new Client_Control_Panel($this, client.host);
	ccp.init();
	service.clients[client.host].panel = ccp;
}

/**
 * 查看性能
 */
function get_client_usage(e) {
	let $this = $('.' + e),
		key = $this.children('.client-item-info').children('.target').text();
}

/**
 * 公共函数, 将服务器状态 icon 修改为暂停/等待
 * @param {string} msg
 */
function change_status_to_wait(msg) {
	let $this = $('#status_icon');
	$this.removeClass('status_go');
	$this.removeClass('status_stop');
	$this.addClass('status_wait');
	$('#status_statetext').html(msg)
}

/**
 * 公共函数, 将服务器状态 icon 修改为运行
 *
 * @param {string} msg
 */
function change_status_to_go(msg = '服务器在线并接受客户端连接.') {
	let $this = $('#status_icon');
	$this.removeClass('status_wait');
	$this.removeClass('status_stop');
	$this.addClass('status_go');
	$('#status_statetext').html(msg)
}

/**
 * 公共函数, 将服务器状态 icon 修改为停止
 *
 * @param {string} msg
 */
function change_status_to_stop(msg = '服务器没有在运行.') {
	let $this = $('#status_icon');
	$this.removeClass('status_wait');
	$this.removeClass('status_go');
	$this.addClass('status_stop');
	$('#status_statetext').html(msg);
}


/**
 * 公共函数, 添加成功后处理页面上的显示和重新绑定click事件
 * @param {string} key 连接对象键值 IP:PORT
 */
function append_client_success(key) {
	let $this = $('.' + service.parse_ip(key));
	$this.addClass('active');
}

/**
 * 公共函数, 添加成功后处理页面上的显示和重新绑定click事件
 * @param {string} key 连接对象键值 IP:PORT
 */
function remove_client_success(key) {
	let $this = $('.' + service.parse_ip(key));
	$this.removeClass('active');
}

/**
 * 初始化将连接对象显示在页面中, 目前用在刷新页面之后重新显示
 *
 * @param {{String: Object}} clients 连接对象列表
 * @param {[string]} sendtos 控制对象列表
 */
function init_client(clients, sendtos) {
	// 先清空
	$('.client-list ul').html('');

	if (Object.keys(service.clients).length === 0) {
		$('.client-list ul').html('<li class="notclient">没有在线的客户端</li>');
		return false
	}

	for (let i in clients) {
		console.log(clients)
		// 删除对象连接中多余的字符
		let ip_port_class = service.parse_ip(clients[i].host);
		// 显示倒页面里里
		add_client_to_page(ip_port_class, clients[i]);
		// 处理已经在控制对象列表中的显示
		if (sendtos.indexOf(clients[i].host) >= 0) {
			append_client_success(clients[i].host)
		}
	}
}

/**
 * 有连接接入时, 将对象显示在页面里, 并显示信息
 *
 * @param {{string}} res
 */
function on_connect(res) {
	let client_obj = JSON.parse(res.data);
	// 删除对象连接中多余的字符
	let ip_port_class = service.parse_ip(client_obj.host);
	// 添加到数组中
	service.clients[client_obj.host] = client_obj;
	$('.client-list ul .notclient').remove();
	// 显示在页面中
	add_client_to_page(ip_port_class, client_obj);
	// 显示信息
	echo_message(get_timer(), 'INFO', '客户端 [' + client_obj.host + '] 已登录。你可以操作它')
}

/**
 * 丢失链接时需要进行的操作
 *
 * @param {{string}} res 必须存在 key 对象ip键值
 */
function on_disconected(res, type) {
	// 打印信息
	echo_message(get_timer(), 'INFO', 'CLIENT [' + res.key + '] 链接丢失: 断开连接. 退出.');
	// 获取解析后的IP字符串, 更改状态为连接丢失
	let $element = $('.' + service.parse_ip(res.key));
	$element.removeClass('active');
	$element.addClass('out');

	// 删除原本的click 事件
	$element.unbind("click");
	// 重新添加click 点击后将自己删除
	$element.click(function() {
		$(this).remove()
	});

	if (type !== "stop_server")
		notification.warning('客户端 ' + res.key  + ' 连接丢失, 断开连接.');

	// 删除监控
	try{
		service.monitor_target = null;
        $('.control-item.command-prompt').show();
        $('#client_usage').hide();
        localStorage.removeItem('_monitor_target');
	}catch (e) {

	}

	// 将他从sendto中删除
	service.sendtos.forEach(function(item, index, arr) {
		if (item === res.key) arr.splice(index, 1);
	});
}

