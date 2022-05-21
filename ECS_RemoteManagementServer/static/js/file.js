(function () {

    // 更新标题
    let title_item = $('.file_upload_t .file_upload_t-item');

    title_item[0].innerHTML = '<h2>请选择发送对象</h2>';
    let seleceNumBox = $('<div><span>已选择:  </span></div>');
    let seleceNum = $('<div>0</div>');
    seleceNumBox.append(seleceNum)
    $(title_item[0]).append(seleceNumBox)

    // 初始化表格
    let data = [["ヽ(*。>Д<)o゜ 这是假数据呢~~!"]],
        header = ['目标地址', '系统信息', '用户']

    let _table = new Table($('#file_upload_list_table'), header, data, 0, "f");
    _table.init_table()


    let send_file_client = {};
    let send_file_button = $('<div class="tag" id="upload_send_btn">立即发送</div>');

    let files = false;

    // 选择文件后
    $('#file_upload').change(function (e) {

        // 发送列表清空
        send_file_client = {}
        files = false

        // 获取文件
        files = this.files[0];

        var createObjectURL = function(blob){
          return window[window.webkitURL ? 'webkitURL' : 'URL']['createObjectURL'](blob);
        };
        var newimgdata = createObjectURL(files);
        $('#file_perview').html(`<a target="_blank" href="${newimgdata}">预览: ${files.name}</a>`)

        // 更新标题
        let title_item = $('.file_upload_t .file_upload_t-item');

        title_item[0].innerHTML = '<h2>请选择发送对象</h2>';
        let seleceNumBox = $('<div><span>已选择:  </span></div>');
        let seleceNum = $('<div>0</div>');
        seleceNumBox.append(seleceNum)
        $(title_item[0]).append(seleceNumBox)

        if($('#upload_send_btn').length === 0) {
            $(title_item[1]).append(send_file_button)
        }else {
            send_file_button.show()
        }

        // 初始化表格
        let data = [],
            header = ['目标地址', '系统信息', '用户']
        for(let i in service.clients) {
            let client = service.clients[i];
            data.push([client['host'], client['os'], client['user']])
        }

        let _table = new Table($('#file_upload_list_table'), header, data, 0);

        _table.on('add', function (data, tr, index) {
            let target = data[0];
            let _exits_in = send_file_client[target];
            if(_exits_in) return

            send_file_client[target] = data
            tr.addClass('hover')

            seleceNum.html(parseInt(seleceNum.html()) + 1)
        })

        _table.on('cancel', function (data, tr, index) {
            let target = data[0];
            let _exits_in = send_file_client[target]
            if(!_exits_in) return

            delete send_file_client[target]
            tr.removeClass('hover')
            seleceNum.html(parseInt(seleceNum.html()) - 1)
        })

        _table.init_table()

        /* 表格 end */
    })

    send_file_button.click(function () {
        if (!files) {
            notification.error("文件出错, 请重新选择")
            return
        }

        if(JSON.stringify(send_file_client) === "{}") {
            notification.error("请选择发送的客户端");
            return
        }

        let title_item = $('.file_upload_t .file_upload_t-item');
        title_item[0].innerHTML = " "
        send_file_button.hide()

        let send_client_host_arr = [],
            table_row_list = {};

        // 初始化表格
        let data = [],
            header = ['目标地址', '系统信息', '用户', '状态']
        for(let i in send_file_client) {
            let item = send_file_client[i];
            send_client_host_arr.push(i)

            item.push('<div class="tag">正在发送中</div>')
            data.push(item)
        }

        let _table = new Table($('#file_upload_list_table'), header, data, 0, false);

        _table.on('ergodic_tr', function (row, data, index) {
            table_row_list[data[0]] = row;
        })

        _table.init_table()

        // end

        let formdata = new FormData()
        formdata.append('files', files)
        formdata.append('host_arr', send_client_host_arr)

        $.ajax({
            url: '/send_file',
            method: 'POST',
            data: formdata,
            processData: false,   // jQuery不要去处理发送的数据
            contentType: false,
            success: function (res) {
                console.log(res)
            },
            error: function (res) {
                res = res.responseJSON;
                notification.error(res.message)
            }
        })

        window.file_distribute = function (data) {
            let row = table_row_list[data.key]
            let status = row[0].children[3]
            if(data.type === "success") {
                status.innerHTML = `<div class="tag tag--success">发送成功, ./files/${data.filename}</div>`
            }else {
                status.innerHTML = '<div class="tag tag--danger">连接丢失了</div>'
            }
        }
    })
}())

