(function () {

    let attacks_notification = {}

    let header = ["服务器地址", "来源地址", "入口", "时间", "XSS注入 检测", "SQL注入 检测"],
        data = []

    let attacks__cumulative_items = $('.attacks__cumulative-item .ck')

    $.ajax({
        url: '/get_traffic',
        async: false,
        success: function (res) {
            res = res.data
            for (let i in res.packet_list) {
                let _packet = res.packet_list[i]
                data.push([_packet['host'], _packet['src'], _packet['method'] + ' ' + _packet['route'], _packet['time'],
                    _packet['_XSS_attack'], _packet['_SQLinjection_attack']])
            }

            $(attacks__cumulative_items[0]).children('.attacks__cumulative-item-value').html(res.total.total)
            $(attacks__cumulative_items[1]).children('.attacks__cumulative-item-value').html(res.total.xss_injection)
            $(attacks__cumulative_items[2]).children('.attacks__cumulative-item-value').html(res.total.sql_injection)

            $(attacks__cumulative_items[3]).children('.attacks__cumulative-item-value').html(res.days.total)
            $(attacks__cumulative_items[4]).children('.attacks__cumulative-item-value').html(res.days.xss_injection)
            $(attacks__cumulative_items[5]).children('.attacks__cumulative-item-value').html(res.days.sql_injection)
        }
    })


    window.danger_data_packet = function (res) {
        // key: "127.0.0.1:12153"   客户端地址端口
        // msg: ""                  数据内容
        // t: "23:42:09"            时间
        let _packet = JSON.parse(res.msg);
        let row_data = [_packet['host'], _packet['src'], _packet['method'] + ' ' + _packet['route'], _packet['time'],
            _packet['_XSS_attack'], _packet['_SQLinjection_attack']]

        $(attacks__cumulative_items[0]).children('.attacks__cumulative-item-value').html(
            parseInt($(attacks__cumulative_items[0]).children('.attacks__cumulative-item-value').html()) + 1
        )
        $(attacks__cumulative_items[3]).children('.attacks__cumulative-item-value').html(
            parseInt($(attacks__cumulative_items[3]).children('.attacks__cumulative-item-value').html()) + 1
        )
        if (_packet['_XSS_attack']) {
            $(attacks__cumulative_items[1]).children('.attacks__cumulative-item-value').html(
                parseInt($(attacks__cumulative_items[1]).children('.attacks__cumulative-item-value').html()) + 1
            )
            $(attacks__cumulative_items[4]).children('.attacks__cumulative-item-value').html(
                parseInt($(attacks__cumulative_items[4]).children('.attacks__cumulative-item-value').html()) + 1
            )
        }
        if (_packet['_SQLinjection_attack']) {
            $(attacks__cumulative_items[2]).children('.attacks__cumulative-item-value').html(
                parseInt($(attacks__cumulative_items[2]).children('.attacks__cumulative-item-value').html()) + 1
            )

            $(attacks__cumulative_items[5]).children('.attacks__cumulative-item-value').html(
                parseInt($(attacks__cumulative_items[5]).children('.attacks__cumulative-item-value').html()) + 1
            )
        }

        _table.add_top_row(row_data)

        // 限流通知, 同一台客户端服务器收到攻击 五分钟内只提醒一次
        if (attacks_notification[_packet['host']] || attacks_notification[_packet['host']] == undefined) {

            attacks_notification[_packet['host']] = false

            setTimeout(function () {
                attacks_notification[_packet['host']] = true
            }, 5 * (1000 * 60))

            // 通知

            let message
            if (_packet['_XSS_attack'])
                message = `客户端 服务器 ${_packet['host']} 受到XSS注入攻击`
            else
                message = `客户端 服务器 ${_packet['host']} 受到SQL注入攻击`
            notification.error(message)
            if (window.Notification) {
                Notification.requestPermission(function (status) {
                    if (status) {
                        new Notification(`检测到 客户端服务器, 被攻击`, {
                            body: message
                        })
                    }
                })
            }
        }

    }

    let _table = new Table($('#traffic_list_table'), header, data, 0, false);

    _table.on('ergodic_tr', function (row, tr_content) {
        if (tr_content.length !== header) return false
    })

    _table.on('ergodic_td', function (row, td_content, index) {
        if (index === "4" || index === "5") {
            if (td_content) return `<div class="tag tag--danger">检测到异常</div>`;
            else return `<div class="tag tag--success">数据包正常</div>`;
        }
    })

    _table.init_table()


})()