
哔哩哔哩 bilibili:  https://www.bilibili.com/video/BV1zy4y1z73B


环境搭建

Python 3.8.2

附件中有 requirements.txt 里面有所用包, 双击运行安装所需环境.bat 建议使用管理员权限打开, 就一句话而已
```shell script
pip install --index-url https://pypi.douban.com/simple -r requirements.txt && pause
```
附件中还有 WinPcap_4_1_3.exe 也需要安装.

启动项目

使用Python执行manage.py即可
```shell script
python manage.py -[options]
```
服务端

服务端程序只有一个可选参数， port 端口, 
```python
opt, args = getopt.getopt(sys.argv[1:], 'p:')
```
开放的HOST为所有
```python
app.run(host="0.0.0.0", port=port)
```
客户端

客户端和服务端一样