__author__ = 'ramon'

import urllib2
import re

from bs4 import BeautifulSoup


def get_post_data(url):
    html = urllib2.urlopen(url).read()
    soup = BeautifulSoup(html)

    post = {}

    post['post_title'] = get_text(soup, "h1", {"class": "no-border"})
    post['post_url'] = url
    post['post_description'] = get_text(soup, "p", {"class": "value"})
    post['post_images'] = ""
    post['post_date'] = get_text(soup, "p", {"class": "line line_pro"})
    post['post_price'] = get_price(soup, "span", {"class": "value"})
    post['post_author'] = get_text(soup, "p", {"class": "title"})
    post['post_city'], post['post_zip'] = get_adress(soup, "span", {"class": "value", "itemprop": "address"})
    post['post_email_sent'] = False
    print post


def get_text(soup, tag, subtags):
    element = soup.findAll(tag, subtags)[0]
    text = element.get_text().encode('utf-8').lstrip().rstrip()
    # print text
    return text


def get_price(soup, tag, subtags):
    text = clean(soup, tag, subtags)
    price = re.sub("[^0-9]", "", text)
    return int(price)


def get_adress(soup, tag, subtags):
    text = clean(soup, tag, subtags)
    city, zip_code = text.split(' ')
    return city, zip_code


get_post_data('https://www.leboncoin.fr/montres_bijoux/992541077.htm?ca=12_s')
