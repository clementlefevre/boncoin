# coding: utf8
import urllib2
import re
import time
from datetime import datetime

from bs4 import BeautifulSoup
from requests.utils import quote

from app.models import Post

BASE_URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q='


def retrieve_description(agent):
    url = BASE_URL + quote(agent.keywords.encode("utf-8")) + "&it=1"

    req = urllib2.Request(url)

    req.add_header('User-Agent',
                   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36')
    req.add_header('Referer', 'https://www.leboncoin.fr/annonces/offres/ile_de_france/?th=1&q=' + quote(
        agent.keywords.encode("utf-8")) + '&parrot=0')

    time1 = datetime.now()

    while True:
        try:
            request = urllib2.urlopen(req)
            break

        except urllib2.HTTPError as e:
            if e.code == 500:
                time.sleep(1)
                continue
            else:
                raise

    response = ""
    charset = "windows-1252"
    while 1:
        data = request.read()
        if not data:
            break
        response += data
        # Check the encoding of the page before reading it
        charset = request.headers['content-type'].split('charset=')[-1]

    time2 = datetime.now()
    print 'took {:10.4f} seconds'.format(
        (time2 - time1).total_seconds())

    html = response.decode(charset)

    soup = BeautifulSoup(html, "html5lib")

    post_raw = []
    if posts_exist(soup):
        posts = soup.findAll("section", {"class": "tabsContent block-white dontSwitch"})
        post_raw += [x.find('a') for x in posts[0].findAll('li')]

    else:
        print "{0} : no post found".format(agent.keywords.encode('utf-8'))

    return post_raw


def posts_exist(soup):
    no_posts_msg = soup.findAll('p', text=re.compile('Aucune annonce trouv'), attrs={'class': 'mbs'})
    exist = len(no_posts_msg) == 0

    return exist


def convert_to_post(raw_posts, agent):
    posts = []
    for raw_post in raw_posts:
        post = {}
        url = get_url(raw_post)
        if url is None:
            continue
        post['post_url'] = get_url(raw_post)
        post['post_title'] = get_title(raw_post)
        post['post_city'] = get_city(raw_post)
        city_str = post['post_city']

        # test_encoding(city_str)
        post['post_date'] = get_date(raw_post)
        post['post_price'] = get_price(raw_post)
        post['post_images'] = ""
        post['post_author'] = ""
        post['post_zip'] = ""
        post['post_retrieved_on'] = datetime.now()

        post = Post(**post)

        posts.append(post)
    print "{0} : posts found : {1}".format(agent.keywords.encode('utf-8'), len(posts))
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
