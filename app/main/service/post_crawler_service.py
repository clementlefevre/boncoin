# coding: utf8
import urllib
import urllib2
import re
import logging

from bs4 import BeautifulSoup

from app import db
from app.email import send_email
from app.main.service.search_agent_service import get_search_agent
from app.models import Post
from manage import app

log = logging.getLogger('apscheduler.executors.default')
log.setLevel(logging.INFO)  # DEBUG

fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)

BASE_URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q='


def retrieve_url():
    with app.app_context():
        agents = get_search_agent()
        active_agents = [x for x in agents if x.is_active]
        for agent in active_agents:
            posts_raw = retrieve_description(agent)
            post_objects = convert_to_post(posts_raw)
            filter_on_new(post_objects, agent)


def get_all_post():
    q = db.session.query(Post).all()
    return q


def retrieve_description(agent):
    url = BASE_URL + urllib.quote(agent.keywords, safe='') + "&it=1"
    html = urllib2.urlopen(url).read()
    soup = BeautifulSoup(html, "html5lib")
    post_raw = []
    posts = soup.findAll("section", {"class": "tabsContent block-white dontSwitch"})
    post_raw += [x.find('a') for x in posts[0].findAll('li')]
    return post_raw


def convert_to_post(raw_posts):
    posts = []
    for raw_post in raw_posts:
        post = {}
        url = get_url(raw_post)
        if url is None:
            continue
        post['post_url'] = get_url(raw_post)
        post['post_title'] = get_title(raw_post)
        post['post_city'] = get_city(raw_post)

        post['post_date'] = get_date(raw_post)

        post['post_price'] = get_price(raw_post)
        post['post_images'] = ""

        post['post_author'] = ""
        post['post_zip'] = ""
        post['post_email_sent'] = False

        post = Post(**post)
        print post
        posts.append(post)
    return posts


def get_url(raw_post):
    url = 'https://' + raw_post["href"].replace("//", "")
    return url


def get_price(raw_post):
    price = raw_post.findAll("h3", {"class": "item_price"})
    if len(price) > 0:
        return int(re.sub("[^0-9]", "", price[0].get_text()))
    else:
        return -10


def get_date(raw_post):
    date = raw_post.findAll("p", {"class": "item_supp"})[2].get_text().split('/')[0].lstrip().rstrip()
    if date is not None:
        return date
    return "Not found"


def get_city(raw_post):
    city = raw_post.findAll("p", {"class": "item_supp"})
    if len(city) > 1:
        city = city[1].get_text()
        return ' '.join(city.split())
    return "Not found"


def get_title(raw_post):
    title = raw_post.findAll("h2", {"class": "item_title"})[0].get_text().lstrip().rstrip()
    if title is not None:
        return title
    return "Not found"


def send_new_post_alert(posts, keywords):
    send_email("clement.san@gmail.com", keywords + ': ' + str(len(posts)) + ' new',
               'auth/email/new_post_alert', posts=posts)


def filter_on_new(posts, agent):
    new_posts = []
    posts = [post for post in posts if (post.post_price >= agent.min_price | post.post_price < 0)]
    for post in posts:
        q = db.session.query(Post).filter(Post.post_url == post.post_url).all()

        if len(q) < 1:
            new_posts.append(post)

    if len(new_posts) > 0:
        for new_post in new_posts:
            db.session.add(new_post)
            db.session.commit()
        send_new_post_alert(new_posts, agent.keywords)


def find_post(post_id):
    return db.session.query(Post).get(post_id)
