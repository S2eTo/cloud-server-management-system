let Client_Control_Panel = /** Class */ (function () {

    function Client_Control_Panel ($client_element, key) {
        // 创建客户端控制面板
        this.$panel = $('<div class="client-func"></div>');

        // 添加到页面
        this.$panel.appendTo($client_element);

        this.$client_element = $client_element;

        this.$usage_views = $('#client_usage');
        /**
         *
         * @type {Client_Control_Panel}
         * @private
         */
        let _self = this;
        // 显示 控制台
        $client_element.children('.client_info').click(function () {
            _self.show();
        });

        /**
         *
         */
        this.key = key;

        /**
         * 点击后的回调函数
         * @type {null}
         */
        this.monitor_callback = null;

        /**
         * 点击后的回调函数
         * @type {null}
         */
        this.control_callback = null;

        /**
         * 点击后的回调函数
         * @type {null}
         */
        this.disconnect_callback = null;

        /**
         * 点击后的回调函数
         * @type {null}
         */
        this.cancel_callback = null;
    }

    Client_Control_Panel.prototype.init = function () {
        this.monitor();
        this.control();
        this.cancel_control();
        this.disconnect();
        this.cancel();
        let _monitor_target = localStorage.getItem('_monitor_target');
        if (_monitor_target === this.key) {
            $('#client_usage .client_main_usage .client_usage_label .name').html(this.key + ' 硬件使用率 (%)');
            $('.control-item.command-prompt').hide();
            this.$usage_views.show();
            this.__close_monitor();
            service.monitor_target = _monitor_target;
            try{
                let barchart = echarts.getInstanceByDom(document.getElementById('client_main_usage_charts'));
                barchart.resize();
                for (let i in document.client_disk_usage.disk) {
                    let barchart = echarts.getInstanceByDom(document.getElementById('client_disk_' + document.client_disk_usage.disk[i]));
                    barchart.resize();
                }
            }catch (e) {

            }
        }
    };

    /**
     * 监控
     */
    Client_Control_Panel.prototype.monitor = function () {

        $button = $('<div class="client-func-item"><i class="iconfont icon-data"></i><span>监控</span></div>');
        $button.appendTo(this.$panel);
        // 绑定事件
        let _self = this;
        $button.click(function () {
            if (service.monitor_target) return notification.warning('已经在监控 '+ service.monitor_target + ', 请先关闭.');
            _self.__init_callback(_self.monitor_callback, function (tis) {
                $('.client_disk_usage').html('');
                if (service.monitor(_self.key)) {
                    $('#client_usage .client_main_usage .client_usage_label .name').html(_self.key + ' 硬件使用率 (%)');
                    _self.hide();
                    $('.control-item.command-prompt').hide();
                    _self.$usage_views.show();
                    _self.__close_monitor();
                    localStorage.setItem('_monitor_target', _self.key);
                    document.client_main_usage = new Client_Usage_Charts();
                    let barchart = echarts.getInstanceByDom(document.getElementById('client_main_usage_charts'));
			        barchart.resize();
                }else {

                }
            })(_self);
        });
        this.monitor_e = $button;
    };

    /**
     * 添加到控制列表
     */
    Client_Control_Panel.prototype.control = function () {
        // 添加控制功能按钮
        $button = $('<div class="client-func-item"><i class="iconfont icon-square3"></i><span>控制</span></div>');
        $button.appendTo(this.$panel);
        /**
         *
         * @type {Client_Control_Panel}
         * @private
         */
        let _self = this;
        // 绑定事件
        $button.click(function () {
            _self.__init_callback(_self.monitor_callback, function (tis) {
                if(service.append_client (_self.key)){
                    append_client_success(_self.key);
                    _self.hide();
                }
            })(_self);
        });
        this.control_e = $button;
    };

    /**
     * 从控制列表中删除
     * @param {Function} func 点击事件回调函数
     */
    Client_Control_Panel.prototype.cancel_control = function (func) {
        // 添加控制功能按钮
        $button = $('<div class="client-func-item"><i class="iconfont icon-square2"></i><span>取消控制</span></div>');
        $button.appendTo(this.$panel);
        /**
         *
         * @type {Client_Control_Panel}
         * @private
         */
        let _self = this;
        // 绑定事件
        $button.click(function () {
            _self.__init_callback(_self.monitor_callback, function (tis) {
                if(service.remove_client(_self.key)) {
                    remove_client_success(_self.key);
                    _self.hide();
                }
            })(_self);
        });
        this.cancel_control_e = $button;
    };

    /**
     * 断开连接
     * @param {Function} func 点击事件回调函数
     */
    Client_Control_Panel.prototype.disconnect = function (func = null) {
        // 添加控制功能按钮
        $button = $('<div class="client-func-item"><i class="iconfont icon-dianyuan"></i><span>断开</span></div>');
        $button.appendTo(this.$panel);
        /**
         *
         * @type {Client_Control_Panel}
         * @private
         */
        let _self = this;
        // 绑定事件
        $button.click(function () {
            _self.__init_callback(_self.monitor_callback, function (tis) {
                messagebox.warning('此操作将会与该客户端断开连接, 你确定要断开吗?', function (tis) {
                    let response = service.disconnect_client(_self.key);
                    if (response.code === 1000) {
                        _self.$client_element.remove();
                        notification.success(response.message);

                        if (service.monitor_target === _self.key) {
                            service.monitor_target = null;
                            $('.control-item.command-prompt').show();
                            _self.$usage_views.hide();
                            localStorage.removeItem('_monitor_target');
                        }
                    }else {
                        notification.error(response.message)
                    }
                })
            })(_self);
        });
        this.disconnect_e = $button;
    };

    /**
     * 取消按钮
     * @param {Function} func 点击事件回调函数
     */
    Client_Control_Panel.prototype.cancel = function (func) {
        // 添加控制功能按钮
        $button = $('<div class="client-func-item"><i class="iconfont icon-square1"></i><span>取消</span></div>');
        $button.appendTo(this.$panel);
        // 绑定事件

        /**
         *
         * @type {Client_Control_Panel}
         * @private
         */
        let _self = this;
        // 影藏控制台
        $button.click(function () {
            _self.hide();
        });

        this.cancel_e = $button;
    };

    Client_Control_Panel.prototype.show = function () {
        this.$panel.addClass('show')
    };

    Client_Control_Panel.prototype.hide = function () {
        this.$panel.removeClass('show')
    };

    /**
     * 初始化函数
     * @param func
     * @param new_func
     * @returns {Function}
     * @private
     */
    Client_Control_Panel.prototype.__init_callback = function (func, new_func) {
        if (!func || typeof func !== 'function') func = new_func;
        return func;
    };

    /**
     * 关闭客户端性能监控
     * @private
     */
    Client_Control_Panel.prototype.__close_monitor = function () {
        $button = $('<span class="close"><i class="iconfont icon-default3"></i><span>关闭监控</span></span>');
        $('.client_usage_label .close').remove();
        $button.appendTo($('.client_main_usage .client_usage_label'));

        /**
         *
         * @type {Client_Control_Panel}
         * @private
         */
        let _self = this;
        $button.click(function () {
            _self.close_monitor_func();
            $('.client_disk_usage').html('');
            notification.info('已关闭对客户端' + _self.key + ', 的性能监控');
            $button.remove();
        })
    };

    Client_Control_Panel.prototype.close_monitor_func = function () {
        service.monitor_target = null;
        $('.control-item.command-prompt').show();
        this.$usage_views.hide();
        localStorage.removeItem('_monitor_target');
        service.close_monitor(this.key);
    };

    return Client_Control_Panel;
}());



