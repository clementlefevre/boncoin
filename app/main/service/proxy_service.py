__author__ = 'ramon'

import csv


def get_proxies():
    reader = csv.reader(open('proxy.csv'), delimiter=";")
    proxies = []
    for row in reader:
        dicto = {"ip": row[0], 'port': row[1], 'type': row[2], 'level': row[3], 'country': row[4]}
        proxies.append(dicto)

    return proxies


PROXIES = get_proxies()
