var excludeSpecial = function(s) {
	return s.replace('/[A-Za-z0-9]*/', '');
 };

let Client_Usage_Charts = /** Class */ (function() {
	function Client_Usage_Charts(ele = 'client_main_usage_charts', create_moke = true) {
		this.ele = ele;
		this.charts_number = 70;

		if (create_moke) {
			this.time = this.create_moke_data();
			this.men = this.create_moke_data();
			this.cpu = this.create_moke_data();
		}else {
			this.time = new Array(this.charts_number);
			this.men = new Array(this.charts_number);
			this.cpu = new Array(this.charts_number);
		}

		this.create_chart();
	}

	/**
	 * 初始化/创建 Charts 图表
	 */
	Client_Usage_Charts.prototype.create_chart = function() {
		let Charts = echarts.init(document.getElementById(this.ele));
		Charts.setOption({
			grid: {
				left: '0%',
				right: '0%',
				top: '5%',
				bottom: '5%'
			},
			xAxis: {
				show: false,
				data: this.time
			},
			yAxis: {
				axisLine: {
					show: false
				},
				axisTick: {
					show: false
				},
				splitLine: {
					show: true,
					lineStyle: {
						width: .5,
						color: '#0000002e'
					}
				},
				splitNumber: 2,
				min: 0,
				max: 100
			},
			series: [{
					symbol: 'none',
					name: 'CPU 使用率',
					type: 'line',
					data: this.cpu,
					itemStyle: {
						normal: {
							color: '#ff97add6'
						}
					},
					areaStyle: {}
				},
				{
					symbol: 'none',
					name: 'RAM 使用率',
					type: 'line',
					data: this.men,
					itemStyle: {
						normal: {
							color: '#51b3ff9e'
						}
					},
					areaStyle: {}
				}
			]
		});
		this.charts = Charts
	};

	Client_Usage_Charts.prototype.update = function(res) {
		this.time.push(res.timer);
		this.men.push(parseFloat(res.men[0]));
		this.cpu.push(parseFloat(res.cpu));

		// 长度超过 30 了就删除数组最后一位
		if (this.time.length >= this.charts_number) {
			this.time.shift();
			this.cpu.shift();
			this.men.shift();
		}

		this.charts.setOption({
			xAxis: {
				data: this.time
			},
			series: [{
					name: 'CPU 使用率',
					data: this.cpu,
				},
				{
					name: 'RAM 使用率',
					data: this.men,
				}
			]
		});
	};

	/**
	 * 获取模拟的数据, 让图表本身好看点
	 * @returns {[]}
	 */
	Client_Usage_Charts.prototype.create_moke_data = function() {
		var arr = [];
		for (var i = 0; i < 70; i++) arr.push(i);
		arr.sort(function() {
			return Math.random() - 0.5;
		});
		// 长度
		arr.length = this.charts_number;
		return arr
	};


	return Client_Usage_Charts;
}());

let Client_Disk_Usage = /** class */ (function() {
	function Client_Disk_Usage() {
		this.data = {
			name: "C",
			total: 114.86148834228516,
			used: 61.77602005004883,
			free: 53.08546829223633,
			percent: 53.8
		};
		this.chart = {};
		this.disk = [];
	}

	Client_Disk_Usage.prototype.init_disk = function(disk) {
		let ele = '<div class="client_disk_item disk_' + disk.name + '_p"><div class="client_disk_item_content">';
		ele += '<div class="disk_name">分区名称: ' + disk.name + '</div>';
		ele += '<div id="client_disk_' + disk.name + '" class="charts-views"></div>';
		ele += '<div class="info"><div class="info-item disk-used">';
		ele +=
			'<span class="legend-dots" style="background:linear-gradient(to right, rgb(255, 128, 171), rgb(255, 163, 128))"></span>';
		ele += '已用空间 <span class="duv">' + parseInt(disk.used) + 'G</span></div>';
		ele += '<div class="info-item disk-free">';
		ele +=
			'<span class="legend-dots" style="background:linear-gradient(to right, rgba(54, 215, 232, 1), rgba(177, 148, 250, 1))"></span>';
		ele += '剩余可用空间 <span class="duv">' + parseInt(disk.free) + 'G</span></div>';
		ele += '<div class="info-item disk-percent">';
		ele +=
			'<span class="legend-dots" style="background: linear-gradient(to right, rgba(6, 185, 157, 1), rgba(132, 217, 210, 1))"></span>';
		ele += '使用率占比 <span class="duv">' + disk.percent + '%</span>';
		ele += '</div></div></div></div>';

		$('.client_usage_views .client_disk_usage').append(ele);

		this.create_chart(disk);
	};

	Client_Disk_Usage.prototype.create_chart = function(disk) {
		var Chart = echarts.init(document.getElementById('client_disk_' + disk.name));
		Chart.setOption({
			color: ['#ff80ab', '#7cc5fe'],
			series: [{
				name: '磁盘使用情况',
				type: 'pie',
				radius: ['50%', '70%'],
				avoidLabelOverlap: false,
				hoverAnimation: false,
				silent: true,
				labelLine: {
					show: false
				},
				data: [{
						value: disk.used
					},
					{
						value: disk.free
					}
				]
			}]
		});
		this.chart['disk_' + disk.name] = Chart
	};

	/**
	 *
	 * @param {Object} disks
	 */
	Client_Disk_Usage.prototype.update = function(disks) {
		for (let key in disks) {
			let disk = disks[key];
			let charelement = $('#client_disk_' + disk.name);
			if (charelement.length === 0) {
				this.disk.push(disk.name);
				this.init_disk(disk);
			} else {
				$('.disk_' + disk.name + '_p .client_disk_item_content .info .disk-used .duv').html(parseInt(disk.used) + 'G');
				$('.disk_' + disk.name + '_p .client_disk_item_content .info .disk-free .duv').html(parseInt(disk.free) + 'G');
				$('.disk_' + disk.name + '_p .client_disk_item_content .info .disk-percent .duv').html(disk.percent + '%');
				this.chart['disk_' + disk.name].setOption({
					series: [{
						data: [{
							value: disk.used
						}, {
							value: disk.free
						}]
					}]
				});
			}
		}
	};

	return Client_Disk_Usage;
}());

document.client_main_usage = new Client_Usage_Charts();
document.client_disk_usage = new Client_Disk_Usage();


function client_usage(res) {
	usage = JSON.parse(res.data.msg);
	main_usage = {
		cpu: usage.cpu,
		men: usage.men,
		timer: usage.timer,
	};
	// 刷新页面上显示的使用率
	$('.client_usage_label .cpu .uvs').html(main_usage.cpu[0] + '%');
	$('.client_usage_label .ram .uvs').html(main_usage.men[0] + '%');
	disk_usage = usage.disk;
	document.client_main_usage.update(main_usage);
	document.client_disk_usage.update(disk_usage);
}