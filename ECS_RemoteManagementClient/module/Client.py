# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: Client.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 本次程序主要的 socket 对象
import platform
import getpass
import struct
import socket
import psutil
from main import cache

class Client:
    def __init__(self):
        self.target:str = "127.0.0.1"

        self.port:int = 8888

        self.status:bool = False

        self.first_connect:bool = True

        self.sock:socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        self.send_usaged = False

        self.__system_info:dict = self.__get_system_info()

        print(' * 主程序初始化完成 ...')

    def connect(self):
        try:
            self.sock.connect((self.target, self.port))
        except ConnectionRefusedError:
            return False, "连接失败. 请检查地址和端口"
        except socket.gaierror:
            return False, "目标 IP 地址不正确, 解析失败"

        # 修改状态
        client.status = True

        # 连接成功后发送自己的系统信息过去
        self.sock.send(str(self.__system_info).encode())
        return True, "连接成功"

    def disconnect (self) -> bool:
        """

        :return:
        """
        # 保留旧的target he port
        target = self.target
        port = self.port

        try:
            self.sock.send(b'[::close]')
        except:
            pass

        #  断开连接
        self.sock.close()

        # 重新初始化对象
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # 重新设置target 和 port
        self.target = target
        self.port = port
        self.status = False
        self.first_connect = True

        return True

    def set_options(self, target:str, port:int) -> {bool, str}:
        """
        设置配置
        :param target:
        :param port:
        :return:
        """

        if target is None or port is None: return False, "设置失败, 请完成输入";
        if target == self.target and port == self.port: return False, "设置失败, 参数未变"
        self.port = int(port)
        self.target = str(target)
        return True, "设置成功, 重启服务器后生效"

    def __get_system_info (self) -> dict:
        """
        获取系统信息和当前系统用户名
        :return:
        """
        bits = ' x' + str(struct.calcsize('P') * 8)
        system = platform.system()
        release = platform.release()
        return {
            "os": system + release + bits,
            "user": getpass.getuser()
        }


    def get_diskusage (self) -> list:
        """
        获取磁盘使用情况, 一小时后重新获取

        :return:
        """

        # 先从缓存中获取
        diskinfo = cache.get('diskinfo')
        # 获取到了就直接返回
        if diskinfo: return diskinfo

        # 缓存过期后重新获取
        disklist = []
        disks = psutil.disk_partitions()
        # 遍历系统磁盘
        for disk in disks:
            # 获取磁盘使用情况

            #  磁盘名称
            name = disk[0]
            # 获取磁盘使用信息
            try:
                disk_usage = psutil.disk_usage(name)
            except:
                continue
            # 获取磁盘总额
            total = disk_usage.total / (1024 * 1024 * 1024)
            # 获取磁盘已用空间
            used = disk_usage.used / (1024 * 1024 * 1024)
            # 获取磁盘可用空间
            free = disk_usage.free / (1024 * 1024 * 1024)
            # 获取磁盘使用百分比
            percent = disk_usage.percent
            # 添加到列表
            if "Windows" in self.__system_info["os"]: name = name[:-2]
            else: name = name.replace('/', '')
            disklist.append({"name": name,"total": total,"used": used,"free": free,"percent": percent})
        # 设置缓存设置过期时间为1小时
        cache.set('diskinfo', disklist, timeout=60 * 60 * 60)
        return disklist


client = Client()

def get_host_ip():
    """
    查询本机ip地址
    :return:
    """
    try:
        s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        s.connect(('8.8.8.8',80))
        ip=s.getsockname()[0]
    finally:
        s.close()

    return ip