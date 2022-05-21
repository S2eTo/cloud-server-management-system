# @Time    : 2020/03/10
# @Author  : JOHNSON
# @FileName: views.py
# @Software: Pycharm
# @Blog    ：https://space.bilibili.com/274407612

# 视图文件，专门返回模板
from main import app
from flask import render_template, request, redirect
from module.Authtication import Administrator, check_login, logout

@app.route('/', methods=['GET'])
def index():
    if not check_login(): return redirect('/login')
    return render_template('index.html')

@app.route('/login', methods=['GET', "POST"])
def login():
    if check_login(): return redirect('/')
    if request.method == "POST":
        username = request.form.get('username')
        passowrd = request.form.get('password')
        admin = Administrator(username, passowrd)
        if admin.check():
            admin.login()
            return {"code": 1, 'message': '登录成功', 'data': {}}, 200
        return {"code": 0, 'message': admin.errors, 'data': {}}, 400
    return render_template('login.html')


@app.route('/logout', methods=["POST"])
def logout_views():
    logout()
    return {"code": 1, 'message': '退出成功', 'data': {}}, 200