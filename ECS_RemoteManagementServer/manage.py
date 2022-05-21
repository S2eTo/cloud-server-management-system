# @Time    : 2020/03/10
# @Author  : JOHNSON
# @FileName: manage.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

import sys
import getopt

import webbrowser
from main import app
import socket as sock

# 引入个文件 不然这些文件都不在执行范围内
from application import views, socket, service, client

"""
该项目是一对多端管理
"""

# 默认开放端口 8000
port = 8000

def main():
    global port

    try:
        opt, args = getopt.getopt(sys.argv[1:], 'p:')
    except getopt.GetoptError as err:
        print('[-] %s' % err)
        exit(0)
        return

    for name, value in opt:
        if name == '-p':
            port = int(value)

    ipaddress = sock.gethostbyname(sock.gethostname())
    webhost = 'http://{}:{}'.format(ipaddress, port)
    print(' * ECS Remote Management Server')
    print('   云服务器远程管理服务端')
    print(' * 本机IP地址为: {}'.format(ipaddress))
    print('   web站点地址为 ' + webhost)
    webbrowser.open('http://127.0.0.1:{}'.format(port))
    app.run(host="0.0.0.0", port=port)



if __name__ == "__main__":
    main()

