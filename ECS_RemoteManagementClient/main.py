# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: main.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

import os

from flask import Flask
from flask_socketio import SocketIO
from flask_caching import Cache
async_mode = None


app = Flask(__name__)
socketio = SocketIO(app, async_mode=async_mode)
cache = Cache()
cache.init_app(app, config={'CACHE_TYPE':'simple'})

UPLOAD_PATH = os.path.join(os.path.dirname(__file__), 'files')