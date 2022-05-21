# @Time    : 2020/03/11
# @Author  : JOHNSON
# @FileName: Response.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 自己封装的 Resnponse 返回信息
import json
from flask import jsonify
from module.Service import service
from module.common import get_timer
from module.Status import StatusOK, StatusInternalServerError, CodeRequestNo, CodeRequestOk, CodeRequestOkButNoChange

def get_service_info() -> object:
    """
    返回服务器信息
    """
    return {
        "host": service.host,
        "port": service.port,
        "status": service.status,
        "client": service.client_obj,
        "sendto": service.sendto
    }

class Resnponse:
    """
    自己封装的 Response 公共对象
    """
    def __init__(self):
        # 初始化数据
        self.data = {
            "timer": get_timer(),
        }

    def success(self, message:str, code:int = CodeRequestOk, type:str = "INFO", headers:object = None) -> jsonify:
        """
        返回请求成功信息

        :param message: 必填, 提示信息
        :param headers: 选填, 自定义头部
        :return: response_class
        """
        self.data['message'] = message
        self.data["data"] = get_service_info()
        self.data["type"] = type
        self.data['code'] = code
        return jsonify(
            self.data
        ), StatusOK, headers

    def error(self, message:str, code:int = CodeRequestNo, status:int = StatusInternalServerError, headers:dict = None) -> jsonify:
        """
        返回请求失败信息

        :param message: 必填, 提示信息
        :param status: 选填, 自定义状态码, 默认为 StatusInternalServerError 500
        :param headers: 选填, 自定义头部
        :return: response_class
        """
        self.data['message'] = message
        self.data["data"] = get_service_info()
        self.data['code'] = code
        return jsonify(
            self.data
        ), status, headers

    def defined(self, data: dict, status:int = StatusOK, headers:dict = None) -> jsonify:
        self.data = data
        self.data["data"] = get_service_info()
        self.data['timer'] = get_timer()
        return jsonify(
            self.data
        ), status, headers

Resnponse = Resnponse()