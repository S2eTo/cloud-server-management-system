# @Time    : 2020/03/12
# @Author  : JOHNSON
# @FileName: Thread.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

import inspect
import ctypes

class Thread:
    """
    停止服务器, 将后台的线程杀死, 这里其实并非需要只是以防万一出问题
    """
    def __init__(self):
        self.threads = []

    def _async_raise(self, tid, exctype):
        """raises the exception, performs cleanup if needed"""
        tid = ctypes.c_long(tid)
        if not inspect.isclass(exctype):
            exctype = type(exctype)
        res = ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, ctypes.py_object(exctype))
        if res == 0:
            raise ValueError("invalid thread id")
        elif res != 1:
            # """if it returns a number greater than one, you're in trouble,
            # and you should call it again with exc=NULL to revert the effect"""
            ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, None)
            raise SystemError("PyThreadState_SetAsyncExc failed")

    def stop_thread(self):
        for thread in self.threads:
            try:
                self._async_raise(thread.ident, SystemExit)
            except:
                pass
        self.threads = []

thread = Thread()