# @Time    : 2020/03/10
# @Author  : JOHNSON
# @FileName: main.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

import os

from flask import Flask
from flask_socketio import SocketIO
async_mode = None

from module.Traffic import attacks_total

app = Flask(__name__)
app.config['SECRET_KEY'] = '_v^o=ytf^y*be7)8yvc6^jp!hx4p@ql_y%4wkh@tud0se0gaut'
socketio = SocketIO(app, async_mode=async_mode)

UPLOAD_PATH = os.path.join(os.path.dirname(__file__), 'files')

