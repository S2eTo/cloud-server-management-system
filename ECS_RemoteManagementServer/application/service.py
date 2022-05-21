# @Time    : 2020/03/11
# @Author  : JOHNSON
# @FileName: service.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 操控 Service 文件
from main import app
from module.Service import service
from module.Response import Resnponse
from module.Status import StatusBadRequest, CodeRequestOkButNoChange, CodeRequestOk
from module.Thread import thread
from module.WriteLog import log
from flask import request, redirect
from module.Authtication import check_login

@app.route('/run_server', methods=["POST"])
def run_server() -> Resnponse:
    """
    开启服务器, 只接收POST请求
    """
    if not check_login(): return redirect('/login')
    # 判断服务器是否已经在运行
    if service.status:
        return Resnponse.error("服务器, 已经在运行", code=CodeRequestOkButNoChange, status=StatusBadRequest)
    try:
        service.run()
        service.status = True
    except OSError:
        return Resnponse.error("端口 {} 已被占用, 通常每个套接字地址(协议/网络地址/端口)只允许使用一次".format(service.port))
    return Resnponse.success("服务器启动成功")


@app.route('/stop_server', methods=["POST"])
def stop_server() -> Resnponse:
    """
    关闭服务器, 只接收POST请求
    """
    if not check_login(): return redirect('/login')
    # 判断服务器是否有在运行
    if not service.status:
        return Resnponse.error("服务器没有在运行", code=CodeRequestOkButNoChange, status=StatusBadRequest)
    # 关闭服务器
    service.close()
    # 杀手后台线程
    thread.stop_thread()
    return Resnponse.success("关闭成功")

@app.route('/set_options', methods=["POST"])
def set_options() -> Resnponse:
    """

    :return: Response
    """
    if not check_login(): return redirect('/login')
    host = str(request.form.get('host'))
    port = int(request.form.get('port'))
    err, msg = service.set_options(host, port)
    if err:
        return Resnponse.success(msg)
    else:
        return Resnponse.error(msg)


@app.route('/get_status', methods=["GET"])
def get_service_status() -> Resnponse:
    """
    获取当前服务器信息, 只接收GET请求
    """
    if not check_login(): return redirect('/login')
    return Resnponse.defined({
        'code': CodeRequestOk,
        'log': log.read(),
        'message': '初始化获取数据成功',
        'type': 'INFO'
    })
