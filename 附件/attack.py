import requests
import random
import time

host_list = [
    "http://10.9.145.22",
]

attack_list = [
    "/?username=%27%20union%20select",
    "/?username=%3CsCript%3E"
]

while True:
    attack = attack_list[random.randint(0, len(attack_list)) - 1]
    host = host_list[random.randint(0, len(host_list)) - 1]
    requests.request(method="get", url=host + attack)

    time.sleep(.5)



    
