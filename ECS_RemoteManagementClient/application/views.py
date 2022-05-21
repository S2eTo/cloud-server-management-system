# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: views.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 视图文件，专门返回模板
from main import app
from flask import render_template
import socket as sock

@app.route('/')
def index():
    ipaddress = sock.gethostbyname(sock.gethostname())
    return render_template('index.html', ip=ipaddress)