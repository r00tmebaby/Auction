import random
import time

test = 0
start = 1
stop = 1000
while test < 100:
    cur_start = start+test
    cur_stop = stop+test + 5
    step = random
    for i in range(cur_start, cur_stop, random.randint(cur_start, cur_stop)):
        print(i)

    test += 1
