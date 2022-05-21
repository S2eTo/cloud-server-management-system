# -*- coding:utf-8 -*-

import time
import json
import uuid
from threading import Thread

from scapy.all import *

from module.Client import get_host_ip, client
from main import socketio

class Traffic():
    def __init__(self):
        self.host = get_host_ip()
        print(self.host)
        self.filter = "dst net {} and dst port 80 or dst port 443 or dst port 8804".format(self.host)

        self.running = False

    def __gen(self):
        return uuid.uuid4().hex

    def capture(self, x):
        """
        捕获到数据包的回调函数接受一个参数 x
        x 是 scapy.layers.l2.Ether 的实例对象

        :param x: scapy.layers.l2.Ether
        :return:
        """

        

        src = x.payload.src
        # if src == self.host: return

        # 拿到数据包
        body = x.lastlayer().original
        print(111111111111111111111111111111111111111111111111111)
        print(body)
        print(b'HTTP/' in body and body[0:4] != b'HTTP')

        if b'HTTP/' in body and body[0:4] != b'HTTP':

            """
            定义数据包

            src: 来源地址, time: 数据包时间, method: 请求方法, route: 请求路由地址
            version: 协议版本, header: 请求头, params: URL参数, content: 请求内容,
            _XSS_attack: XSS 攻击, _SQLinjection_attack: SQL注入攻击
            """
            _packet = {
                "src": src,
                "host": self.host,
                "time": "",
                "method": "GET",
                "route": "/",
                "version": "1.1",
                "header": {},
                "_XSS_attack": False,
                "_SQLinjection_attack": False
            }

            print(111111111111111111111111111111111111111111111111111)

            """
            进行安全检测

            检测数据包中的异常数据, 检测到返回对象, 没有则返回 None
            <re.Match object; span=(397, 409), match=b''>
            """
            if re.search(rb'%3C([a-zA-Z0-9/]*)%3E', body, re.I):
                _packet["_XSS_attack"] = True
            if re.search(rb'([%22%27]*)([%20]*)union([%20]+)select', body, re.I):
                _packet["_SQLinjection_attack"] = True

            if not _packet["_XSS_attack"] and not _packet["_SQLinjection_attack"]:
                return

            print(_packet)

            print(111111111111111111111111111111111111111111111111111)

            # 计算时间
            timeStamp = int(x.payload.time)
            timeArray = time.localtime(timeStamp)
            _packet["time"] = time.strftime("%Y-%m-%d %H:%M:%S", timeArray)

            # 解析内容
            header_bytes, content_bytes = body.split(b"\r\n\r\n")
            for header_item in header_bytes.decode().split("\r\n"):
                header_item_arr = header_item.split(":", 1)

                if (len(header_item_arr) == 1):
                    """
                    第一行是请求头包含信息 请求方法, 请求路由地址, 协议版本

                    ['POST /cgi-bin/httpconn HTTP/1.1']
                    """

                    _packet["method"], _packet["route"], _packet["version"] = header_item_arr[0].split(" ")

                    # 解析 url 参数
                    p_route = _packet["route"].split("?")
                    _packet["route"] = p_route[0]

                    continue

                hkey, hvalue = header_item_arr
                key = hkey.strip()
                value = hvalue.strip()

                _packet["header"][key] = value

            socketio.emit('server_response', {'action': 'on_traffic_packet', 'data': _packet}, namespace='/channel')
            client.sock.send(('[::DangerDataPacket]' + json.dumps(_packet)).encode())

            filepath = self.__get_path(src, _packet["_XSS_attack"], _packet["_SQLinjection_attack"])
            file = open(filepath, 'wb')
            file.write(body)
            file.close()

    def __get_path(self, src, _xss, _sql):
        import datetime

        path = './traffic/' + datetime.datetime.now().strftime('%Y/%m/%d/')
        isExists = os.path.exists(path)
        if not isExists: os.makedirs(path)
        return path + self.__get_filename(src, _xss, _sql)

    def __get_filename(self, src, _xss, _sql) -> str:
        """
        私有方法, 设置文件名
        :param name: 文件名称
        :return:
        """
        if _xss:
            return 'XSSinjection{}_{}_{}.txt'.format(src, self.host, self.__gen())
        elif _sql:
            return 'SQLinjection{}_{}_{}.txt'.format(src, self.host, self.__gen())

    def run(self):
        if not self.running:
            self.running = True
            Thread(target=self.__run).start()
            return True, "启动成功"
        return False, "重复启动"

    def __run(self):
        print('..........................0')
        print(self.filter)
        sniff(filter=self.filter, prn=lambda x: Thread(target=self.capture, args=(x,)).start())

traffic = Traffic()