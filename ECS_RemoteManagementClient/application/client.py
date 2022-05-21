# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: client.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 操控 Client

import os
import threading
import psutil
import json
import subprocess

from flask import request

from main import app, UPLOAD_PATH
from module.Client import client
from module.Response import Resnponse
from module.Status import StatusBadRequest, CodeRequestOkButNoChange, CodeRequestOk
from module.Thread import thread
from module.WriteLog import log
from main import socketio
from module.common import get_timer
from module.Traffic import traffic


push_usage_status = False

def save_file(filename, data):
    file = open(os.path.join(UPLOAD_PATH, filename), 'wb')
    file.write(data)
    file.close()

    # 先推送信息给前端
    socketio.emit('server_response',
                  {'action': 'on_recv', 'data': {'key': 'Service', 'msg': '收到服务器的文件 ./files/{}'.format(filename), "t": get_timer()}},
                  namespace='/channel')
    log.write('收到服务器的文件, ./files/{}\r'.format(filename), 'Service')

@app.route('/connect', methods=["POST"])
def connect() -> Resnponse:
    """
    开启服务器, 只接收POST请求
    """

    # 判断服务器是否已经在运行
    if client.status:
        return Resnponse.error("已有连接, 请勿重连", code=CodeRequestOkButNoChange, status=StatusBadRequest)
    conn, msg = client.connect()
    if conn:
        print('....................................................')
        traffic.run()
        thread.threads.append(socketio.start_background_task(target=wait_recv))
        return Resnponse.success(msg)
    return Resnponse.error(msg)


@app.route('/disconnect', methods=["POST"])
def disconnect() -> Resnponse:
    """
    与服务器断开连接, 关闭连接
    """

    global push_usage_status
    # 判断服务器是否有在运行
    if not client.status:
        return Resnponse.error("没有任何连接", code=CodeRequestOkButNoChange, status=StatusBadRequest)
    push_usage_status = False
    client.send_usaged = False
    # 关闭服务器
    client.disconnect()
    # 杀手后台线程
    thread.stop_thread()
    return Resnponse.success("断开连接成功")

@app.route('/set_options', methods=["POST"])
def set_options() -> Resnponse:
    """

    :return: Response
    """
    target = str(request.form.get('target'))
    port = int(request.form.get('port'))
    err, msg = client.set_options(target, port)
    if err:
        return Resnponse.success(msg)
    else:
        return Resnponse.error(msg)


@app.route('/get_status', methods=["GET"])
def get_service_status() -> Resnponse:
    """
    获取当前服务器信息, 只接收GET请求
    """

    return Resnponse.defined({
        'code': CodeRequestOk,
        'log': log.read(),
        'message': '初始化获取数据成功',
        'type': 'INFO'
    })

def push_usage():
    """
    每隔三秒推送一次 CPU 内存和磁盘的使用状况,
    """

    while client.send_usaged:
        # 获取当前 CPU 使用率
        cpus = psutil.cpu_percent(interval=None, percpu=True)
        # 获取当前内存使用率
        phymem = psutil.virtual_memory()
        memory_usage = phymem.percent
        memory_size = "{}/{}".format(str(int(phymem.used / 1024 / 1024)),
                                     str(int(phymem.total / 1024 / 1024)) + "M")
        diskusage = client.get_diskusage()
        # 获取时间
        t = get_timer()
        # 推送数据
        data = {"cpu": cpus,"men": [memory_usage, memory_size],"disk": diskusage,'timer': t}
        data = json.dumps(data)
        try:
            client.sock.send(('[::usage]%s' % data).encode())
        except OSError:
            client.send_usaged = False
            break
        # 阻塞2秒
        socketio.sleep(2)

def _disconnection ():
    global push_usage_status

    client.send_usaged = False
    client.disconnect()
    socketio.emit('server_response', {'action': 'disconnect', 'key': ''}, namespace='/channel')
    push_usage_status = False

def wait_recv():
    """
    在后台接收客户端消息
    :param client: 连接对象
    :param key: 连接对象的键值 IP:PORT
    :return:
    """
    global push_usage_status
    while client.status:
        try:
            data = client.sock.recv(4096)
        except ConnectionResetError:
            # 服务器主动与客户端断开连接
            _disconnection()
            break
        except ConnectionAbortedError:
            # 客户端主动与服务器断开连接
            _disconnection()
            break
        except:
            _disconnection()
            break

        if data == b'':
            # 接收到空数据
            _disconnection()
            break

        # 讲信息编码
        data = data.decode('utf8', 'ignore')
        if data[:9] == '[::usage]':
            client.send_usaged = False
            client.send_usaged = True
            if not push_usage_status:
                push_usage_status = True
                thread.usage.append(socketio.start_background_task(target=push_usage))
        elif data[:10] == '[::nusage]':
            client.send_usaged = False
            push_usage_status = False
            thread.stop_usage()
        elif data[:19] == "[::file_distribute]":
            # 拿到文件大小
            size, filename = data[19:].split('&&')
            size = int(size)

            # 循环接受内容, 知道接收到一模一样长度的内容, 跳出循环保存文件
            while True:
                # 接受数据内容
                filedata = client.sock.recv(size)

                if len(filedata) == size: break
                # 如果不是一模一样长度的数据, 就是别的命令, 作为别的命令去解析

                if data[:9] == '[::usage]':
                    client.send_usaged = False
                    client.send_usaged = True
                    if not push_usage_status:
                        push_usage_status = True
                        thread.usage.append(socketio.start_background_task(target=push_usage))
                elif data[:10] == '[::nusage]':
                    client.send_usaged = False
                    push_usage_status = False
                    thread.stop_usage()
                else:
                    # 先推送信息给前端
                    socketio.emit('server_response',
                                {'action': 'on_recv', 'data': {'key': 'Service', 'msg': filedata, "t": get_timer()}},
                                namespace='/channel')

                    # 开线程执行命令
                    thread.threads.append(threading.Thread(target=exec_command, args=(filedata,)).start())

                    log.write('{}\r'.format(filedata), 'Service')

            threading.Thread(target=save_file, args=(filename, filedata)).start()
        else:
            # 先推送信息给前端
            socketio.emit('server_response',
                          {'action': 'on_recv', 'data': {'key': 'Service', 'msg': data, "t": get_timer()}},
                          namespace='/channel')

            # 开线程执行命令
            thread.threads.append(threading.Thread(target=exec_command, args=(data,)).start())

            log.write('{}\r'.format(data), 'Service')


def exec_command(command):
    command = command.strip()
    output = None
    if command in ['python']:
        output = ('命令 "{}" 执行失败, 不可执行无返回值命令\r\n'.format(command)).encode("GBK")
    if output is None:
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, shell=True)
        except:
            output = ('命令 "{}" 执行失败, 请检查语法是否正确.\r\n'.format(command)).encode("GBK")

    # 将结果发给前端
    socketio.emit('server_response',
                      {'action': 'exec_command', 'data': {'key': 'Service', 'msg': output.decode('GBK', 'ignore'), "t": get_timer()}},
                      namespace='/channel')

    # 将结果发回给服务器
    client.sock.send(output)
    log.write(output.decode('GBK', 'ignore').replace('\n', ''), 'Service')