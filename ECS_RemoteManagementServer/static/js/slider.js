var Slider = /** class */ (function() {

	/**
	 *
	 * @param operation
	 * @param targets
	 * @constructor
	 */
	function Slider(operation, targets) {
		this.operation_class = operation;
		this.targets_class = targets;
		/**
		 *
		 * @type {Slider}
		 * @private
		 */
		let __self = this;

		/**
		 *
		 * @type {*|jQuery|HTMLElement}
		 */
		this.operation = $(operation);


		/**
		 *
		 * @type {*|jQuery|HTMLElement}
		 */
		this.targets = $(targets);

		/**
		 * 初始化
		 */
		this.init()
	}

	/**
	 *
	 */
	Slider.prototype.init = function() {
		/**
		 *
		 * @type {Slider}
		 * @private
		 */
		let __self = this;

		this.storage_init();

		// 将所有 target 对象隐藏, 在css哪里 display none 会影响echarts
		this.targets.css({
			display: 'none'
		});

		// 给操作项加上点击事件
		this.operation.click(function() {
			__self.switch(__self.operation.index(this));
		});

		this.operation.removeClass('active');

		// 默认显示
		this.__content.addClass('block-in');
		this.__operation.addClass('active');


	};

	/**
	 *
	 * @param {int} index
	 */
	Slider.prototype.switch = function(index) {
		let __self = this;

		// 如果当前显示的和要切换的一样直接 return
		if (this.__index === index) return false;

		// 将旧的对象影藏
		this.__content.removeClass('block-in');
		this.__content.addClass('block-out');
		this.__operation.removeClass('active');

		// 拿到新的对象
		let new_content = $(this.targets[index]),
			new_operation = $(this.operation[index]);



		// 将新的对象显示出来
		new_operation.addClass('active');
		new_content.addClass('block-in');

		// 将原本的display none
		document.querySelectorAll(this.targets_class)[this.__index].addEventListener('webkitAnimationEnd', function() {
			$(this).removeClass('block-out');
		});

		// 更新目前的对象
		this.__set_storage(index);
		__self.__set_new(index, new_content, new_operation);

		this.__init_callback(this.on_switch, function (tis, index) {})(this, index);
	};

	/**
	 *
	 * @param {int} index
	 * @param {jQuery|HTMLElement} content
	 * @param {jQuery|HTMLElement} operation
	 * @private
	 */
	Slider.prototype.__set_new = function(index = 0, content = $(this.targets[0]), operation = $(this.operation[0])) {
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this.__index = index;

		/**
		 *
		 * @type {jQuery|HTMLElement}
		 * @private
		 */
		this.__content = content;

		/**
		 *
		 * @type {jQuery|HTMLElement}
		 * @private
		 */
		this.__operation = operation;
	};

	Slider.prototype.storage_init = function() {
		let index = this.__get_storage();
		if (!index) index = 0;

		let new_content = $(this.targets[index]),
			new_operation = $(this.operation[index]);
		// 设置默认对象
		this.__set_new(index, new_content, new_operation);
	};

	Slider.prototype.__set_storage = function(index) {
		localStorage.setItem('index', index)
	};

	Slider.prototype.__get_storage = function(index) {
		return localStorage.getItem('index')
	};

	Slider.prototype.__init_callback = function (func, new_func) {
		if (!func || typeof func !== 'function') func = new_func;
		return func;
	};

	return Slider;
}());
