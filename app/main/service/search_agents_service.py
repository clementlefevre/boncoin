import urllib2
import datetime

from bs4 import BeautifulSoup

from app import db
from app.models import SearchAgent, Post

URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q=patek%20philippe%20&it=1'


def retrieve_url():
    html = urllib2.urlopen(URL).read()
    soup = BeautifulSoup(html)
    posts = soup.findAll("section", {"class": "tabsContent block-white dontSwitch"})
    url_list = []
    for post in posts:
        url_list.extend([x['href'] for x in post.findAll('a')])
        print datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    filter_on_new(url_list)


def test():
    q = db.session.query(Post).all()
    print q


def filter_on_new(url_list):
    for url in url_list:
        url = url.replace("//", "")
        url = 'https://' + url
        print url
        q = db.session.query(Post).filter(Post.post_url == url).all()

        if len(q) < 1:
            create_new_post(url)


def create_new_post(url):
    html = urllib2.urlopen(url).read()
    soup = BeautifulSoup(html)

    post = {}

    post['post_title'] = soup.findAll("h1", {"class": "no-border"})[0].get_text().lstrip().rstrip()
    post['post_url'] = url
    post['post_description'] = soup.findAll("p", {"class": "value"})[0].get_text().lstrip().rstrip()
    post['post_images'] = ""
    post['post_date'] = soup.findAll("p", {"class": "line line_pro"})[0].get_text().lstrip().rstrip()
    post['post_price'] = soup.findAll("span", {"class": "value"})[0].get_text().lstrip().rstrip()
    post['post_author'] = soup.findAll("p", {"class": "title"})[0].get_text().lstrip().rstrip()
    post['post_ville'] = \
        soup.findAll("span", {"class": "value", "itemprop": "address"})[0].get_text().lstrip().rstrip().split(' ')
    post['post_email_sent'] = False
    post = Post(**post)
    db.session.add(post)
    db.session.commit()


def get_all_agents():
    search_agents = db.session.query(SearchAgent).all()
    print search_agents

    return search_agents


def find_post(post_id):
    return db.session.query(Post).get(post_id)


import atexit

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=retrieve_url,
    trigger=IntervalTrigger(seconds=5),
    id='printing_job',
    name='Print date and time every five seconds',
    replace_existing=True)
# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())
