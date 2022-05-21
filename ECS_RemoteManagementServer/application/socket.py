# @Time    : 2020/03/11
# @Author  : JOHNSON
# @FileName: socket.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 长连接 websocket 文件
import json
import psutil
import threading
from main import socketio
from module.common import get_timer
from module.Service import service
from module.Response import get_service_info
from module.Thread import thread
from module.WriteLog import log
from module.Client import Client
from module.Authtication import check_login
from module.Traffic import attacks_total
# 线程锁
thread_lock = threading.Lock()


@socketio.on('connect', namespace='/channel')
def wait_on_connect():
    """
    socketio连接成功后执行该函数
    """

    # 要先开启服务器才能接入socket
    if service.status and check_login():
        with thread_lock:
            if service.first_connect:
                # 判断是否已经开启过后台监听了, 不然多连会出事
                thread.threads.append(socketio.start_background_task(target=push_cpu_usage))
                thread.threads.append(socketio.start_background_task(target=wait_connect))
                service.first_connect = False


def push_cpu_usage():
    """
    每隔三秒推送一次 CPU 使用状况,
    这里先推送了在执行 sleep 阻塞, 第一次连接的时候就会马上收到信息
    """
    while service.status:
        # 获取当前 CPU 使用率
        cpus = psutil.cpu_percent(interval=None, percpu=True)
        # 获取当前内存使用率
        phymem = psutil.virtual_memory()
        memory_usage = phymem.percent
        memory_size = "{}/{}".format(str(int(phymem.used / 1024 / 1024)),
                                     str(int(phymem.total / 1024 / 1024)) + "M")
        # 获取时间
        t = get_timer()
        # 推送数据
        socketio.emit('server_response', {
            'action': 'usage_action',
            'data': {
                "cpu": cpus,
                "men": [memory_usage, memory_size],
                'timer': t
            },
        }, namespace='/channel')
        # 阻塞2秒
        socketio.sleep(2)


def wait_connect():
    """
    等待客户端连接
    :return:
    """
    while service.status:
        # 阻塞等待连接
        try:
            client_socket, addr = service.sock.accept()
            print(addr)
        except OSError:
            # # 接入连接错误, 关闭服务器
            service.close()
            # # 推送信息
            socketio.emit('server_response', {'action': 'on_server_error', 'data': get_service_info()},
                          namespace='/channel')
            break

        # 处理连接对的IP:PORT作为键值, 保存socket
        client_key = addr[0] + ":" + str(addr[1])
        print('收到来自 {} 的连接'.format(client_key))

        # 连接成功后客户端会发送自己的信息过来, 将信息存到dict中
        os_info = client_socket.recv(1024)
        client_obj = eval(os_info.decode('utf-8'))
        client = Client(client_key, client_obj['os'], client_obj['user'], client_socket)
        # 将连接对象信息保存到 Service 对象中
        service.client_obj[client_key] = client.get_info()
        service.client[client_key] = client
        # 开启线程在后台接收该对象的信息
        threading.Thread(target=wait_recv, args=(client_key, )).start()
        # 推送信息给前端
        socketio.emit('server_response', {'action': 'on_connect', 'data': json.dumps(client.get_info())},
                      namespace='/channel')
        log.write('客户端 [{}] 已登录。你可以操作它\r'.format(client_key))


# 信息处理
def _handle(data, key):
    data = data.decode('gbk', 'ignore')
    if data[:9] == "[::usage]":
        socketio.emit('server_response',
                      {'action': 'client_usage', 'data': {'key': key, 'msg': data[9:], "t": get_timer()}},
                      namespace='/channel')
    elif data[:20] == "[::DangerDataPacket]":
        _packet = data[20:]
        socketio.emit('server_response',
                      {'action': 'danger_data_packet', 'data': {'key': key, 'msg': _packet, "t": get_timer()}},
                      namespace='/channel')
        attacks_total.on_danger_packet(_packet)
    else:
        socketio.emit('server_response',
                      {'action': 'on_recv', 'data': {'key': key, 'msg': data, "t": get_timer()}},
                      namespace='/channel')
        log.write(data.replace('\n', ''), key)


def wait_recv(key:str):
    """
    在后台接收客户端消息, 同时能起到监控客户端连接状态
    :param client: 连接对象
    :param key: 连接对象的键值 IP:PORT
    :return:
    """
    while service.status:
        data, err = service.client[key].wait_recv(4096)
        if err is None:
            threading.Thread(target=_handle, args=(data, key)).start()
        else:
            break