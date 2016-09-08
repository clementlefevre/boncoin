import urllib2
import datetime

from bs4 import BeautifulSoup

URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q=patek%20philippe%20&it=1'


# In[ ]:

def retrieve_description():
    html = urllib2.urlopen(URL).read()
    soup = BeautifulSoup(html)

    posts = soup.findAll("section", {"class": "tabsContent block-white dontSwitch"})

    for post in posts:
        a = [x['href'] for x in post.findAll('a')]
        print datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        print a




# schedule.every(10).minutes.do(retrieve_description)


def send_email(body):
    pass




class BonCoinPost():
    pass

#
# while 1:
#     schedule.run_pending()
#     time.sleep(1)
