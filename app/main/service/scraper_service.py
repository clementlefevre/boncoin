# coding: utf8
import urllib2
import re
from datetime import datetime

from bs4 import BeautifulSoup
from requests.utils import quote

from app.models import Post

BASE_URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q='


def retrieve_description(agent):
    url = BASE_URL + quote(agent.keywords.encode("utf-8")) + "&it=1"

    req = urllib2.Request(url)
    # req.add_header('Referer', 'https://www.google.com/')


    req.add_header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    req.add_header('Accept-Encoding', 'gzip, deflate, sdch, br')
    req.add_header('Accept-Language', 'en-US,en;q=0.8,de;q=0.6,fr;q=0.4')
    req.add_header('Cache-Control', 'max-age=0')
    req.add_header('Connection', 'keep-alive')
    req.add_header('Cookie',
                   'hideCookieFrame=1; xtvrn=$562498$; xtidc=14775619677798192130; layout=0; oas_ab=a; ADventoriAlreadyTargeted_Ooshop=1; sq=ca=12_s&w=3&q=207&it=1; cookieFrame=2; utag_main=v_id:0157ecb8eb0e001fc547d35a03d105069003a061009dc$_sn:20$_ss:1$_st:1479477831978$_pn:1%3Bexp-session$ses_id:1479476031978%3Bexp-session; _pulse2data=abe0c14b-3cf7-4bdc-9e7d-90d138b861d7,v,x,1479476932169,eyJraWQiOiJhODFmNDQ0OSIsImVuYyI6IkExMjhDQkMtSFMyNTYiLCJhbGciOiJkaXIifQ..0YvRjk0DdOUHvOOTPml3tw.A6G91Kv3nEWlCMiFrgRkbIoO7EokhWHC27nq1C4pjemhqv0PFyw8q_o7lZlZOVOOfmND2HVF6YzaYTUhRGWYlAigeHGh8pMYp62qATwW0TQYD1s5Z1x1-u3XS8APk_mdZgLtDChETWT__J4toDFq_PIGVK9HURzYEs_BfcG4R1ZcZ_jDcOCKg5PBmDhXO3YlEl0ujUErcn53v68SoDYu7eZHbQvYEcUQK8NnRn_C6RY.97k-Ews13XhHM7WvWiiwKw,2806035270368495447,1479490432169,true,unresolved,; crtg_rta=; xtan562498=-undefined; xtant562498=1')

    req.add_header('Host', 'www.leboncoin.fr')
    req.add_header('Upgrade-Insecure-Requests', '1')
    req.add_header('User-Agent',
                   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36')

    proxy = urllib2.ProxyHandler({'http': '91.121.42.68:80'})
    opener = urllib2.build_opener(proxy)
    urllib2.install_opener(opener)
    try:
        request = urllib2.urlopen(url)
    except Exception as e:
        print "{0} : Error {1}".format(url, e.args)
        return []

    response = ""
    charset = "windows-1252"
    while 1:
        data = request.read()
        if not data:  # This might need to be    if data == "":   -- can't remember
            break
        response += data
        # Check the encoding of the page before reading it
        charset = request.headers['content-type'].split('charset=')[-1]

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
