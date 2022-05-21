// 开启服务
$('.start-server').click(function() {
	service.run_server();

});

// 关闭服务
$('.stop-server').click(function() {
	service.stop_server()
});

$('.logout').click(function () {
	$.ajax({
		url: '/logout',
		method: 'POST',
		success: function (res) {
			notification.success('注销成功..');
			location.replace("/login");
		},
		error: function (res) {
			console.log()
		}
	})
});

var sliderslider = new Slider('.views .item.sider.list .item', '.views .item.content .content-item')

$('#set_options').click(function() {
	service.set_options($('#server_host').val(), $('#server_port').val())
});
