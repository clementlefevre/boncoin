import atexit
import urllib2
import datetime
import re

from apscheduler.schedulers.background import BackgroundScheduler

from apscheduler.triggers.interval import IntervalTrigger

from bs4 import BeautifulSoup

from app import db
from app.email import send_email, send_mail_smtp
from app.models import Post

URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q=patek%20philippe%20&it=1'


def retrieve_url():
    html = urllib2.urlopen(URL).read()
    soup = BeautifulSoup(html)
    posts = soup.findAll("section", {"class": "tabsContent block-white dontSwitch"})
    url_list = []

    send_mail_smtp("Hello", "lista")

    for post in posts:
        url_list.extend([x['href'] for x in post.findAll('a')])
        print datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    filter_on_new(url_list)


def test():
    q = db.session.query(Post).all()
    print q


def send_new_post_alert(new_urls):
    send_email("clement.san@gmail.com", 'New Post Bon Coing',
               'auth/email/new_post_alert', posts=new_urls)


def filter_on_new(url_list):
    new_urls = []
    for url in url_list:
        url = url.replace("//", "")
        url = 'https://' + url
        print url
        q = db.session.query(Post).filter(Post.post_url == url).all()

        if len(q) < 1:
            new_post = get_post_data(url)
            new_urls.append(new_post)
    if len(new_urls) > 0:
        send_new_post_alert(new_urls)


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
    post = Post(**post)
    db.session.add(post)
    db.session.commit()
    return post


def get_text(soup, tag, subtags):
    element = soup.findAll(tag, subtags)[0]
    text = element.get_text().encode('utf-8').lstrip().rstrip()
    # print text
    return text


def get_price(soup, tag, subtags):
    text = get_text(soup, tag, subtags)
    price = re.sub("[^0-9]", "", text)
    return int(price)


def get_adress(soup, tag, subtags):
    text = get_text(soup, tag, subtags)
    splitto = text.split(' ')
    if len(splitto) == 1:
        city, zip_code = "", splitto[0]
    else:
        city, zip_code = splitto[0], splitto[1]
    return city, zip_code


def find_post(post_id):
    return db.session.query(Post).get(post_id)


import logging

log = logging.getLogger('apscheduler.executors.default')
log.setLevel(logging.INFO)  # DEBUG

fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)

scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=retrieve_url,
    trigger=IntervalTrigger(seconds=20),
    id='printing_job',
    name='Print date and time every five seconds',
    replace_existing=True)
# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())
