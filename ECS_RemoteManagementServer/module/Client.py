# @Time    : 2020/04/01
# @Author  : JOHNSON
# @FileName: Client.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

from module.Service import service
from main import socketio

class Client:

    # 初始化实例
    def __init__(self, host:str, os:str, user:str, socket):
        """

        :param host: 客户端的IP地址和端口
        :param os: 客户端系统信息
        :param user: 客户端用户
        :param socket: socket 连接对象
        """

        # 将所有属性设成私有, 外部无法直接访问
        self.__host = host
        self.__os = os
        self.__user = user
        self.__socket = socket

    def wait_recv(self, size = 1024):
        """
        开始监听服务器发来的指令
        :param size: default 1024 bit
        :return:
        """
        try:
            data = self.__socket.recv(size)
        except ConnectionResetError:
            # 客户端主动与服务器
            service.remove_client(self.__host)
            if (self.__host == service.client_monitor): service.client_monitor = None
            socketio.emit('server_response', {'action': 'on_disconected', 'key': self.__host}, namespace='/channel')
            return "客户端主动与服务器断开连接", True
        except ConnectionAbortedError:
            # 服务器主动与客户端断开连接
            if (self.__host == service.client_monitor): service.client_monitor = None
            return "服务器主动与客户端断开连接", True

        if data == b'':
            # 接收到空数据
            if (self.__host == service.client_monitor): service.client_monitor = None
            self.__socket.close()
            service.remove_client(self.__host)
            socketio.emit('server_response', {'action': 'on_disconected', 'key': self.__host}, namespace='/channel')
            return "接收到服务器空数据", True

        return data, None

    def send(self, msg):
        self.__socket.send(msg)

    def get_info(self):
        """
        返回客户端信息
        :return: dict
        """
        return {
            'host': self.__host,
            'os': self.__os,
            'user': self.__user
        }

    def close(self):
        """
        关闭客户端
        :return: bool
        """

        self.__socket.close()
