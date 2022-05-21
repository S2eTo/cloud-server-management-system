let Notification = (function () {
    /**
     *
     * @constructor
     */
    function Notification() {
        /**
         * 类型对象
         * @type {{success: {title: string, slug: string}, warning: {title: string, slug: string}, error: {title: string, slug: string}, info: {title: string, slug: string}}}
         * @private
         */
        this._type = {
            info: {slug: 'info',title: '信息'},
            success: {slug: 'success',title: '成功'},
            warning: {slug: 'warning',title: '警告'},
            error: {slug: 'error',title: '错误'},
        };

        /**
         * 父元素对象
         * @type {jQuery|HTMLElement}
         * @private
         */
        this._body = $('.notification__list');

        /**
         * 显示时间
         * @type {number}
         * @private
         */
        this._timer = 3000;

        /**
         * 动画时间. 这里其实要比实际的动画时间少 100 毫秒也是 0.1 秒,
         * setTimeout 有计算减去所以这里写实际的就好了
         * @type {number}
         * @private
         */
        this._animate_timer = 300;
    }

    /**
     * 普通信息通知
     * @param {String} content
     */
    Notification.prototype.info = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.info));
    };

    /**
     * 成功信息通知
     * @param {String} content
     */
    Notification.prototype.success = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.success));
    };

    /**
     * 警告信息通知
     * @param {String} content
     */
    Notification.prototype.warning = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.warning));
    };

    /**
     * 错误信息通知
     * @param {String} content
     */
    Notification.prototype.error = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.error));
    };

    /**
     * 私有方法, 不过JavaScript没有这个概念.
     * 将内容显示在页面里
     * @param {jQuery|HTMLElement} Element
     * @private
     */
    Notification.prototype._show = function (Element) {
        let _self = this;
        Element.appendTo(this._body);
        // 开启计时
        let _timerout = setTimeout(function () {
            Element.removeClass('notification__show');
            _self._remove(_timerout, Element)
        }, this._timer + (this._animate_timer - 100));

        // 给close添加功能
        $(Element.children('.notification__group').children('.notification__closeBtn')).click(function () {
            _self._remove(_timerout, Element)
        });
    };

    /**
     * 私有方法, 不过JavaScript没有这个概念.
     * 将显示的通知关掉, 在页面删除
     * @param _timerout
     * @param Element
     * @private
     */
    Notification.prototype._remove = function (_timerout, Element) {
        clearTimeout(_timerout);
        Element.addClass('notification_hide');
        let _t = setTimeout(function () {
            Element.remove();
            clearTimeout(_t);
        }, this._animate_timer - 100);
    };

    /**
     * 私有方法, 不过JavaScript没有这个概念.
     * 创建一个对象.
     * @param {String} content
     * @param {{slug: string,title: string}} type
     * @returns {jQuery|HTMLElement}
     * @private
     */
    Notification.prototype._create = function (content, type = this._type.info) {
        let ele = '<div class="notification notification__show">';
        ele += '<i class="notification__icon notification-icon-'+ type.slug +'"></i>';
        ele += '<div class="notification__group">';
        ele += '<h2 class="notification__title">'+ type.title +'</h2>';
        ele += '<div class="notification__content">'+ content +'</div>';
        ele += '<div class="notification__closeBtn"><img src="/static/img/close.png" alt=""></div></div></div>';
        return $(ele);
    };

    return Notification;
}());

let notification = new Notification();