

from bs4 import BeautifulSoup



from requests.utils import quote
import urllib2
import re
from datetime import datetime
import logging


from app.models import Post

BASE_URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q='


def retrieve_description(agent):
    print ("agent.keywords str" + agent.keywords)
    print ("agent.keywords type" + str(type(agent.keywords)))

    print ("agent.keywords unicode " + agent.keywords.encode("utf-8"))
    
    url = BASE_URL + quote(agent.keywords.encode("utf-8")) + "&it=1"
    print ("url"+url)
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
        post['post_retrieved_on'] = datetime.now()

        post = Post(**post)

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
        city = city[1].get_text().encode("utf-8")
        return ' '.join(city.split())
    return "Not found"


def get_title(raw_post):
    title = raw_post.findAll("h2", {"class": "item_title"})[0].get_text().lstrip().rstrip()
    if title is not None:
        return title.encode("utf-8")
    return "Not found"

