# @Time    : 2020/03/10
# @Author  : JOHNSON
# @FileName: Service.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

import os
import socket
import threading


from main import UPLOAD_PATH, socketio

def get_file(path):
    f = open(path, 'rb')
    return f.read()

class Service:
    def __init__(self, host:str = "0.0.0.0", port:int = 8888):
        """
        构造函数, 初始化信息

        :param host: 选填, 监听地址, 默认为 0.0.0.0
        :param host: 选填, 监听端口, 默认为 8888
        :return:
        """
        
        # 初始化 socket 对象 作为我们服务器的对象
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # 用于存储连接对象信息和对象, ["ip:port": {...}]
        self.client = {}

        # sss
        self.client_obj = {}

        # 发送对象列表 是连接对象的IP加端口组成的 "IP:PORT" 例: 127.0.0.1:547510
        self.sendto = []

        # 服务器运行状态
        self.status = False

        # 默认监听 IP 地址,
        self.host = host

        # 默认监听的 Port 端口
        self.port = port

        # 第一次连接
        self.first_connect = True

        self.client_monitor = None

        # 打印信息
        print(' * 主程序初始化完成 ...')


    # 用于开启服务
    def run(self):
        """
        开启服务器 / 开启监听, 并修改服务器运行状态为 启动

        :return:
        """

        # 绑定地址
        self.sock.bind((self.host, self.port))
        # 开启监听
        self.sock.listen(20)
        # 服务器运行状态为 启动
        self.status = True

        self.first_connect = True

        #
        print(" * 服务器已运行在 {}:{}".format(self.host, self.port))

    def close(self):
        """
        关闭/停止服务器|断开连接 并修改服务器运行状态为 关闭

        :return:
        """
        # 断开连接
        try:
            self.sock.close()
        except AttributeError:
            pass

        # 初始化 socket 对象 作为我们服务器的对象
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # 用于存储连接对象信息和对象, ["ip:port": {...}]
        self.client = {}

        self.client_obj = {}

        # 发送对象列表 是连接对象的IP加端口组成的 "IP:PORT" 例: 127.0.0.1:547510
        self.sendto = []

        # 服务器运行状态
        self.status = False

        # 默认监听 IP 地址,
        self.host = self.host

        # 默认监听的 Port 端口
        self.port = self.port

        # 第一次连接
        self.first_connect = True

    def append_client_to_sendlist(self, client_key:str) -> [bool, str]:
        """
        添加连接对象/受控端到需要发送对象的 list 列表里

        :param client_key: 连接对象键值 IP:PORT
        :return:  返回两个参数, 执行结果和提示信息 成功移除结果为 bool 值 执行成功返回 True 否则返回 False
        """

        # 判断key是否在 client 中
        if client_key in self.client:
            # 判断是否已经在发送对象列表中了
            if client_key in self.sendto:
                return False, "连接对象 [{}] 已在操作对象列表中".format(client_key)
            # 将键值存到存储需要发送对象的 list 中
            self.sendto.append(client_key)
            return True, "成功将连接对象 [{}] 添加到操作对象列表".format(client_key)
        return False, "连接对象 [{}] 没有连接或连接已丢失".format(client_key)

    def remove_client_from_sendlist(self, client_key:str) -> [bool, str]:
        """
        从发送对象列表中删除连接对象

        :param client_key: 连接对象键值 IP:PORT
        :return:  返回两个参数, 执行结果和提示信息 成功移除结果为 bool 值 执行成功返回 True 否则返回 False
        """

        # 判断key是否已经在列表中中
        if client_key in self.sendto:
            # 从列表中移除
            self.sendto.remove(client_key)
            return True, "成功将连接对象 [{}] 从操作对象列表中移除".format(client_key)
        return False, "操作对象列表中没有 [{}] 的连接对象".format(client_key)

    def disconnect(self, client_key:str) -> [bool, str]:
        """
        主动与连接对象断开连接

        :param client_key: 连接对象键值 IP:PORT
        :return:  返回两个参数, 执行结果和提示信息 成功移除结果为 bool 值 执行成功返回 True 否则返回 False
        """

        # 判断是否有这个对象
        if client_key in self.client:
            # 断开 socket 连接
            self.client[client_key].close()
            # 删除此连接对象
            self.remove_client(client_key)
            return True, "已关闭对象 {} 的连接".format(client_key)
        return False, "该对象没有连接或连接已丢失"

    def remove_client(self, client_key:str):
        """
        从连接对象列表中删除

        :param client_key: 连接对象键值 IP:PORT
        :return:
        """
        # 判断连接列对象表中是否包含该对象, 包含删除
        if client_key in self.client:
            del self.client[client_key]
            del self.client_obj[client_key]
        # 判断发送对象列表中是否包含该对象, 包含删除
        if client_key in self.sendto:
            self.sendto.remove(client_key)

    def send(self, message:str):
        """
        发送数据给连接对象

        :param message: 需要发送的数据
        :return:
        """

        # 只能发送字节流所以先编码一下
        message = message.encode()

        if len(self.sendto) == 0:
            print('没有任何接收对象哟')
            return

        # 提高性能开启线程到后台运行
        threading.Thread(target=self.__send, args=(message, )).start()

    def __send(self, message: bytes):
        """
        私有函数, 真实发送数据的函数
        :param message:
        :return:
        """
        # 遍历发送对象列表
        for key in self.sendto:
            # 拿到 client.socket 对象发送数据
            self.client[key].send(message)

    def set_options(self, host: str, port: int) -> [bool, str]:
        """
        设置配置
        :param host: 监听地址
        :param port: 监听端口
        :return:
        """
        if host is None or port is None: return False, "设置失败, 请完成输入";
        if host == self.host and port == self.port: return False, "设置失败, 参数未变"
        self.port = int(port)
        self.host = str(host)
        return True, "设置成功, 重启服务器后生效"

    def send_file(self, host_arr: str, filename):
        host_arr = host_arr.split(',')
        for key in host_arr:
            try:
                client = self.client[key]
                print(client)
            except KeyError:
                # 通知前端, 连接丢失了
                socketio.emit('server_response', {'action': 'file_distribute', 'data': {"type": "lose_connection", "key": key}},
                              namespace='/channel')
                continue

            filepath = os.path.join(UPLOAD_PATH, filename)
            # 拿到文件数据
            data = get_file(filepath)

            try:
                client.send(('[::file_distribute]{}&&{}'.format(len(data), filename)).encode())
                client.send(data)
            except Exception:
                socketio.emit('server_response',
                              {'action': 'file_distribute', 'data': {"type": "lose_connection", "key": key}},
                              namespace='/channel')
                continue

            socketio.emit('server_response',
                          {'action': 'file_distribute', 'data': {"type": "success", "key": key, "filename": filename}},
                          namespace='/channel')

        # 文件传输完之后 将文件删除
        if os.path.exists(filepath):
            os.remove(filepath)

# 初始化全局对象, 使用默认的 0.0.0.0:8888
service = Service()