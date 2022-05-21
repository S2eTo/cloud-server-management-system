/**
 * 公共函数, 输出信息在运行反馈
 *
 * @param {string} timer     时间
 * @param {string} type      类型
 * @param {string} message   信息内容
 */
function echo_message(timer, type, message) {
    if(type) type = ' ['+ type +'] ';
    element = "<div class='command-response-item'><pre>" + timer + type + message + "</pre></div>";
    $('#response').append(element);
    document.getElementById('response').scrollTop = document.getElementById('response').scrollHeight;
}

/**
 * 公共函数, 获取当前时间, 00:00:00 小时:分钟:秒
 */
function get_timer() {
    date_obj = new Date();
    hours = date_obj.getHours();
    if (hours.toString().length === 1) hours = '0' + hours;
    minutes = date_obj.getMinutes();
    if (minutes.toString().length === 1) minutes = '0' + minutes;
    seconds = date_obj.getSeconds();
    if (seconds.toString().length === 1) seconds = '0' + seconds;
    timer_str = hours + ":" + minutes + ":" + seconds;
    return timer_str
}

function man_response(res, options) {
    // 每个请求都更新我们的 client 对象
    let status = client.update_status(res.data);
    // 输出信息
    if (res.type) echo_message(res.timer, res.type, res.message);
    // 执行函数
    if (typeof options.response == "function") options.response(res, status)
}

function request(options) {
    options.success = function (res) {
        man_response(res, options)
    };
    options.error = function (res) {
        if ([400, 500].indexOf(res.status) >= 0) man_response(res.responseJSON, options)
    };
    return $.ajax(options)
}