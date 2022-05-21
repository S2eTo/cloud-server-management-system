# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: common.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 公共函数
import time

def get_timer() -> str:
    """
    获取时间

    :return: 当前时间 00:00:00 小时:分钟:秒
    """
    return time.strftime('%H:%M:%S', time.localtime())