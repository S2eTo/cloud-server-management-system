# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: socket.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 长连接 websocket 文件
import json
import psutil
import threading
from main import socketio

from module.Client import client
from module.Response import get_service_info
from module.Thread import thread
from module.WriteLog import log

# 线程锁
thread_lock = threading.Lock()


@socketio.on('connect', namespace='/channel')
def wait_on_connect():
    """
    socketio连接成功后执行该函数
    """
    print('Socket 连接成功..')