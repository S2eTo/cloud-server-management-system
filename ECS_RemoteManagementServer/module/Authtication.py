# @Time    : 2020/04/07
# @Author  : JOHNSON
# @FileName: Authtication.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

import hashlib
from flask import session

class Administrator():
    def __init__(self, username, password):
        self.__username = username
        self.__password = password
        self.__login = False

    def login(self) -> bool:
        """
        登录
        :return: bool
        """
        if self.__is_vali is None: self.check()
        if not self.__is_vali and self.__login: return False
        self.__login = True
        session['_auth_user'] = self.__encryption()

    @property
    def info(self) -> object:
        """
        返回用户信息
        :return:
        """
        if self.__is_vali is None and not self.__is_vali: return None
        return {
            'username': self.__username
        }

    def check(self) -> bool:
        """
        验证用户, 不主动验证, 执行登陆时也会验证
        :return:
        """
        if(self.__password is None):
            self._errors = '密码不能为空'
            return False
        if(self.__get_password() and self.__encryption() == self.__get_password()):
            self.__is_vali = True
            return True
        self._errors = '用户名或密码错误'
        self.__is_vali = False
        return False

    @property
    def errors(self) -> str:
        """
        返回错误信息
        :return: str
        """
        return self._errors

    def __encryption(self) -> str:
        """
        密码加密
        :return: str
        """
        m = hashlib.md5()
        m.update(self.__password.encode())
        return m.hexdigest()

    def __get_password(self) -> [str, bool]:
        """
        获取用户名密码
        :return: [str, bool]
        """
        try:
            file = open('./module/' + self.__username, 'r')
        except:
            self._errors = '用户名或密码错误'
            return False
        return file.read()

def check_login() -> bool:
    """
    验证登录
    :return:
    """
    address = session.get('_auth_user')
    if address is None: return False
    return True

def logout() -> bool:
    """
    退出登录
    :return:
    """
    try:
        session.pop('_auth_user')
    except:
        pass
    return True