/**
 * 初始化将连接对象显示在页面中, 目前用在刷新页面之后重新显示
 */
function init_status () {
    if (client.status) change_status_to_go('连接正常...');
    $('#server_target').val(client.target);
    $('#server_port').val(client.port);
}

/**
 * 丢失链接时需要进行的操作
 * 
 */
function disconnect() {

    change_status_to_stop('没有建立连接');

    // 断开socket
    socket.close();

    // 更新状态
    client.status = false;

    notification.warning('已与服务器断开连接.')
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
    $('#status_statetext').html(msg);
    $('.connect_status span').html(msg);
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
    $('#status_statetext').html(msg);
    $('.connect_status span').html(msg);
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
    $('.connect_status span').html(msg);
}
