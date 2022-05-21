class Table {
    /**
     * 构造函数
     * @param mount 挂载点
     * @param header 头数据
     * @param data 数据
     * @param tools
     * @param identification 唯一标识字段索引
     */
    constructor(mount, header, data, identification, tools = true) {
        this.mount = mount;
        this.mount.addClass('table__')
        this.tools = tools

        this.identification = identification
        this.header = header;
        this.data = data;
    }

    init_table() {
        this.mount.html('')

        this.theader = $(`<div class="table__header"></div>`);
        this.append_row(this.theader, this.header, 1, 'th')
        this.theader.appendTo(this.mount)



        this.tbody = $(`<div class="table__body"></div>`);
        if (this.data.length === 0)
            this.append_row(this.tbody, ["Σ( ⚆൧⚆) 数据被外星人抓走了~~!!"])
        for(let i in this.data) this.append_row(this.tbody, this.data[i], i)
        this.tbody.appendTo(this.mount)
    }

    append_row (parent, data, index, type = 'td') {
        let row;
        if (type === 'td') {
            row = $(`<div class="table__tr" identification="${data[this.identification]}"></div>`);
            this.ergodic_tr(row, data)
        }
        else row = $(`<div class="table__tr"></div>`);

        for(let i in data){
            if(type === 'td') {
                let change = this.ergodic_td(row, data[i], i)
                if(change) this._append_td(row, change, type)
                else this._append_td(row, data[i], type)
            }else {
                this._append_td(row, data[i], type)
            }
        }

        if (index && this.tools) {
            if (type === 'td') {
                if (this.tools !== "f")
                    this._init_tools(row, data, index)
            } else {
                this._append_td(row, '操作', type)
            }
        }
        row.appendTo(parent)
    }

    on (event, func) {
        this[event] = func
    }

    _append_td (tr, data, type = 'td', _class = '') {
        let td = $(`<div class="table__${type} ${_class}">${data}</div>`);
        tr.append(td)
    }

    _init_tools (tr, data, index) {
        let tools = $(`<div class="table__td table__td-tools"></div>`),
            _self = this;

        let add = $('<div class="table__td-tools-item">添加</div>');
        add.click(function () {
            if(typeof _self.add === 'function') {
                _self.add(data, tr, index)
            }
        });

        tools.append(add)

        let cancel = $('<div class="table__td-tools-item">取消</div>');
        cancel.click(function () {
            if(typeof _self.cancel === 'function') {
                _self.cancel(data, tr, index)
            }
        });

        tools.append(cancel)

        tr.append(tools)
    }

    add_top_row (row_data) {
        if (this.data.length === 0) this.tbody.html("")
        this.data.push(row_data)

        let row = $(`<div class="table__tr" identification="${data[this.identification]}"></div>`);
        this.ergodic_tr(row, row_data)

        for(let i in row_data){
            let change = this.ergodic_td(row, row_data[i], i)
            if(change) this._append_td(row, change, 'td')
            else this._append_td(row, row_data[i], 'td')
        }

        if (this.tools) {
            if (this.tools !== "f")
                this._init_tools(row, data, index)
        }

        this.tbody.prepend(row)
    }

    _change_row (tr, td, data) {

    }

    _delete_row (data) {

    }

    ergodic_td (row, data, index) {

    }

    ergodic_tr(row, data) {

    }
}