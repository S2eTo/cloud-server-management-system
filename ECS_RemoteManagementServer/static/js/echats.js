// 实例化 echarts 对象
let usage_charts = new Client_Usage_Charts('cpu-status', false);

var update_mychart = function(res) {
	let main_usage = {
		cpu: res.data.cpu,
		men: res.data.men,
		timer: res.data.timer,
	};
	$('.service_usage_label .cpu .uvs').html(main_usage.cpu[0] + '%');
	$('.service_usage_label .ram .uvs').html(main_usage.men[0] + '%');
	usage_charts.update(main_usage);
};
