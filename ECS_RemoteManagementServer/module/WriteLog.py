# @Time    : 2020/03/13
# @Author  : JOHNSON
# @FileName: WriteLog.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612


import datetime
from module.common import get_timer
import os

class WriteLog:
    def __get_path(self) -> str:
        """
        私有方法, 获取文件路径
        :return:
        """
        path = './log/' + datetime.datetime.now().strftime('%Y/%m/')
        isExists = os.path.exists(path)
        if not isExists: os.makedirs(path)
        return path + self.__get_filename()

    def __get_filename(self) -> str:
        """
        私有方法, 设置文件名
        :param name: 文件名称
        :return:
        """
        return  datetime.datetime.now().strftime('%Y%m%d') + '.txt'

    def write(self, message: str, type:str = "INFO"):
        fo = open(self.__get_path(), "a")
        logitem = get_timer() + ' [{}]: '.format(type)
        logitem += message
        fo.write(logitem)
        fo.close()

    def read(self):
        try:
            with open(self.__get_path()) as file_obj:
                content = file_obj.read()
                return content
        except:
            return None

log = WriteLog()