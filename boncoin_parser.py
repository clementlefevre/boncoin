
# coding: utf-8

# In[1]:

from bs4 import BeautifulSoup
import urllib2
import smtplib
import sched, time
import schedule
import datetime

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


# In[ ]:

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


# In[ ]:


schedule.every(10).minutes.do(retrieve_description)


# In[ ]:

def send_email(body):
    pass


# In[ ]:

class BonCoinPost():
    pass


while 1:
   schedule.run_pending()
   time.sleep(1)
