from app import db
from bs4 import BeautifulSoup
import urllib2
import smtplib
import datetime
import time
import atexit

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.models import SearchAgent,Post


URL = 'https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?q=patek%20philippe%20&it=1'



def retrieve_description():
    html = urllib2.urlopen(URL).read()
    soup = BeautifulSoup(html)
    
    posts = soup.findAll("section", {"class": "tabsContent block-white dontSwitch"})
   
    for post in posts:
        
        a = [x['href'] for x in post.findAll('a')]
        print datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        print a


def get_all_agents():
    
    search_agents = db.session.query(SearchAgent).all()
    print search_agents

    return search_agents


def find_post(post_id):
	return db.session.query(Post).get(post_id)


scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=retrieve_description,
    trigger=IntervalTrigger(minutes=2),
    id='retrieve_description',
    name='retrieve_description every minute',
    replace_existing=True)
# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())