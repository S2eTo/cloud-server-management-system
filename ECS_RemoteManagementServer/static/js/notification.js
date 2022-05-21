let _Notification = (function() {
	/**
	 *
	 * @constructor
	 */
	function _Notification() {
		/**
		 *
		 * @type {{success: {title: string, slug: string}, warning: {title: string, slug: string}, error: {title: string, slug: string}, info: {title: string, slug: string}}}
		 * @private
		 */
		this._type = {
			info: {
				slug: 'info',
				title: '信息'
			},
			success: {
				slug: 'success',
				title: '成功'
			},
			warning: {
				slug: 'warning',
				title: '警告'
			},
			error: {
				slug: 'error',
				title: '错误'
			},
		};

		/**
		 *
		 * @type {jQuery|HTMLElement}
		 * @private
		 */
		this._body = $('.notification__list');

		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._timer = 5000;
	}

	/**
	 *
	 * @param {string} content
	 */
	_Notification.prototype.info = function(content) {
		// 创建一个对象
		this._show(this._create(content, this._type.info));
	};

	/**
	 *
	 * @param {string} content
	 */
	_Notification.prototype.success = function(content) {
		// 创建一个对象
		this._show(this._create(content, this._type.success));
	};

	/**
	 *
	 * @param {string} content
	 */
	_Notification.prototype.warning = function(content) {
		// 创建一个对象
		this._show(this._create(content, this._type.warning));
	};

	/**
	 *
	 * @param {string} content
	 */
	_Notification.prototype.error = function(content) {
		// 创建一个对象
		this._show(this._create(content, this._type.error));
	};

	/**
	 *
	 * @param {jQuery|HTMLElement} Element
	 * @private
	 */
	_Notification.prototype._show = function(Element) {
		let _self = this;
		Element.appendTo(this._body);
		// 开启计时
		let timer = setTimeout(function() {
			Element.removeClass('notification__show');
			_self._remove(timer, Element)
		}, this._timer + 200);

		// 给close添加功能
		$(Element.children('.notification__group').children('.notification__closeBtn')).click(function() {
			_self._remove(timer, Element)
		});
	};

	/**
	 *
	 * @param {setTimeout} timer
	 * @param {jQuery|HTMLElement} Element
	 * @private
	 */
	_Notification.prototype._remove = function(timer, Element) {
		clearTimeout(timer);
		Element.addClass('notification_hide');
		let _t = setTimeout(function() {
			Element.remove();
			clearTimeout(_t);
		}, 200)
	};

	/**
	 *
	 * @param type
	 * @param {string} content
	 * @returns {jQuery|HTMLElement}
	 * @private
	 */
	_Notification.prototype._create = function(content, type = this._type.info) {
		let ele = '<div class="notification notification__show">';
		ele += '<i class="notification__icon notification-icon-' + type.slug + '"></i>';
		ele += '<div class="notification__group">';
		ele += '<h2 class="notification__title">' + type.title + '</h2>';
		ele += '<div class="notification__content">' + content + '</div>';
		ele += '<div class="notification__closeBtn"><img src="/static/img/close.png" alt=""></div></div></div>';
		return $(ele);
	};

	return _Notification;
}());

let notification = new _Notification();
