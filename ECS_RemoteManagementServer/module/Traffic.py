import os
import json
import datetime

from module.common import get_timer

class AttacksTotal():
    def __init__(self):
        self.attacks = {
            "total": {},
            "days": {},
            "packet_list": []
        }

        # 初始化统计
        self.__init_total()
        self.__init_days_total()

    def on_danger_packet(self, data):
        _packet = json.loads(data)

        # 判断攻击类型 统计攻击次数
        if _packet["_XSS_attack"]:

            # Xss 注入
            self.attacks['days']['xss_injection'] = int(self.attacks['days']['xss_injection']) + 1
            self.attacks['total']['xss_injection'] = int(self.attacks['total']['xss_injection']) + 1
        elif _packet["_SQLinjection_attack"]:

            # sql注入
            self.attacks['days']['sql_injection'] = int(self.attacks['days']['sql_injection']) + 1
            self.attacks['total']['sql_injection'] = int(self.attacks['total']['sql_injection']) + 1

        self.attacks['days']['total'] = int(self.attacks['days']['total']) + 1
        self.attacks['total']['total'] = int(self.attacks['total']['total']) + 1

        self.attacks['packet_list'].append(_packet)

        self.write("total", self.attacks["total"])
        self.write("days", self.attacks["days"])

        if len(self.attacks['packet_list']) >= 15:
            try:
                self.attacks['packet_list'].pop()
            except Exception:
                pass

    def __init_days_total(self):
        self.days_total_path = './traffic/days.json'
        # 判断路径是否存在
        isExists = os.path.exists(self.days_total_path)
        if not isExists:
            # 如果文件不存在则当日数据全部为默认数据
            self.attacks["days"] = {
                "total": 0,
                "xss_injection": 0,
                "sql_injection": 0
            }

            self.write("days", self.attacks["days"])

        else:
            # 存在我们就在文件里读就好了
            self.attacks["days"] = json.loads(self.__read(self.days_total_path))

    def __init_total(self):
        self.total_path = './traffic/total.json'
        # 判断路径是否存在
        isExists = os.path.exists(self.total_path)
        if not isExists:
            # 如果文件不存在则当日数据全部为默认数据
            self.attacks["total"] = {
                "total": 0,
                "xss_injection": 0,
                "sql_injection": 0
            }

            self.write("total", self.attacks["total"])

        else:
            # 存在我们就在文件里读就好了
            self.attacks["total"] = json.loads(self.__read(self.total_path))

    def __read(self, path):
        file = open(path, 'r')
        data = file.read()
        file.close()
        return data

    def write(self, type, data):
        path = ""

        # 判断类型 决定路径
        if type == "days":
            path = self.days_total_path
        elif type == "total":
            path = self.total_path

        # 转码数据
        if isinstance(data, dict):
            data = json.dumps(data)

        if not isinstance(data, bytes):
            data = data.encode()

        file = open(path, "wb")
        file.write(data)
        file.close()

attacks_total = AttacksTotal()