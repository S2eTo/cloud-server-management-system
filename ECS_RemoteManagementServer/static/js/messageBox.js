/**
 * 目前只提供 warning 警告提示弹出询问窗口
 * @type {MessageBox}
 */

let MessageBox = (function () {
    /**
     *
     * @constructor
     */
    function MessageBox() {
        /**
         * 类型对象
         * @type {{success: {title: string, slug: string}, warning: {title: string, slug: string}, error: {title: string, slug: string}, info: {title: string, slug: string}}}
         * @private
         */
        this._type = {
            info: {slug: 'info',title: '信息'},
            success: {slug: 'success',title: '成功'},
            warning: {slug: 'warning',title: '提示'},
            error: {slug: 'error',title: '错误'},
        };

        /**
         * 父元素对象
         * @type {jQuery|HTMLElement}
         * @private
         */
        this._body = $('body');

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
    MessageBox.prototype.info = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.info));
    };

    /**
     * 成功信息通知
     * @param {String} content
     */
    MessageBox.prototype.success = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.success));
    };

    /**
     * 警告信息通知
     * @param {String} content
     * @param {Function} func
     */
    MessageBox.prototype.warning = function (content, func) {
        // 创建一个对象
        this._show(this._create(content, this._type.warning, func));
    };

    /**
     * 错误信息通知
     * @param {String} content
     */
    MessageBox.prototype.error = function (content) {
        // 创建一个对象
        this._show(this._create(content, this._type.error));
    };

    /**
     * 私有方法, 不过JavaScript没有这个概念.
     * 将内容显示在页面里
     * @param {jQuery|HTMLElement} Element
     * @param {Function} func
     * @private
     */
    MessageBox.prototype._show = function (Element, func = null) {
        this.$box.appendTo(this._body);
		if (!$('.message-box__mask').length) {
			this.$mask.appendTo(this._body);
		}
    };

    /**
     * 私有方法, 不过JavaScript没有这个概念.
     * 将显示的通知关掉, 在页面删除
     * @param _timerout
     * @param Element
     * @private
     */
    MessageBox.prototype._remove = function (_timerout, Element) {
        this.$box.removeClass('message-box__animation-fade-in');
		this.$box.addClass('message-box__animation-fade-out');
		this.$mask.removeClass('message-box__animation__mask-fade-in');
		this.$mask.addClass('message-box__animation__mask-fade-out');
		let _self = this;
        let _t = setTimeout(function () {
			_self.$box.remove();
			_self.$mask.remove();
        }, this._animate_timer - 100);
    };


    /**
     * 私有方法, 不过JavaScript没有这个概念.
     * 创建一个对象.
     * @param {String} content
     * @param {{slug: string,title: string}} type
     * @param {Function} func
     * @private
     */
    MessageBox.prototype._create = function (content, type = this._type.info, func) {
        let ele = '<div class="message-box message-box__animation-fade-in"><div class="message-box__header"><div class="message-box__title">';
        ele += '<span>'+ type.title +'</span></div><div class="message-box__headerbtn"><img src="img/close.png" alt="">';
        ele += '</div></div><div class="message-box__content"><div class="message-box__container">';
        ele += '<div class="message-box__status icon-'+ type.slug +'"></div><div class="message-box__message">';
        ele += '<p>'+ content +'</p></div></div></div>';
        ele += '</div>';
        this.$box = $(ele);

        this.btn_group(func);
        this.mask();
    };

    MessageBox.prototype.btn_group = function (func) {
        let $message_box__btns = $('<div class="message-box__btns"></div>');
        let $cancel = $('<div class="button button--default button--small">取消</div>');
        $cancel.appendTo($message_box__btns);
        let $confirm = $('<div class="button button--default button--small button--primary ">确定</div>');
        $confirm.appendTo($message_box__btns);
        $message_box__btns.appendTo(this.$box);

        let _self = this;
        $cancel.click(function () {
            _self._remove();
        });

        $confirm.click(function () {
            let ishide = func(_self);
			if (ishide === false) return false;
			_self._remove();
        });
    };

    MessageBox.prototype.mask = function () {
        this.$mask = $('<div class="message-box__mask message-box__animation__mask-fade-in"></div>');
        let _self = this;
        this.$mask.click(function () {
            _self.$box.remove();
            _self.$mask.remove();
        });
    };

    return MessageBox;
}());

let messagebox = new MessageBox();