# coding: utf8
#
from datetime import datetime, timedelta
from multiprocessing.pool import ThreadPool
import random
import time

import manage
from app import db
from app.main.service.search_agent_service import get_search_agent
from scraper_service import retrieve_description, convert_to_post
from app.models import Post
from app.email import send_email

DAYS_IN_PAST = 10


def timing(f):
    def wrap(*args):
        time1 = datetime.now()
        ret = f(*args)
        time2 = datetime.now()
        print '%s function took %0.3f seconds' % (f.func_name, (time2 - time1).total_seconds())
        return ret

    return wrap


@timing
def retrieve_url():
    print "*******************START PARSING********************"
    with manage.app.app_context():
        agents = get_search_agent()

        active_agents = [x for x in agents if x.is_active]
        random.shuffle(active_agents)

        chunked = chunks(active_agents, 2)

        for chunk in chunked:
            print chunk
            pool = ThreadPool(4)

            pool.map(parse_page, chunk)

            pool.close()
            pool.join()
            time.sleep(10)
        print "*******************FINISHED PARSING********************"


def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in xrange(0, len(l), n):
        yield l[i:i + n]


def parse_page(agent):
    try:

        posts_raw = retrieve_description(agent)

        if len(posts_raw) > 0:
            post_objects = convert_to_post(posts_raw, agent)
            filter_on_new(post_objects, agent)



    except Exception as e:
        print (e.args)
        print "Error by parsing : {}".format(agent.keywords.encode('utf-8'))


def filter_on_new(posts, agent):
    try:
        new_posts = []
        posts_price_ok = [post for post in posts if (post.post_price >= agent.min_price or post.post_price < 0)]

        for post in posts_price_ok:
            q = db.session.query(Post).filter(Post.post_url == post.post_url).all()
            if len(q) < 1:
                new_posts.append(post)

        if len(new_posts) > 0:
            print "{0} : new posts :{1}".format(agent.keywords.encode('utf-8'), len(new_posts))
            for new_post in new_posts:
                db.session.add(new_post)
                db.session.commit()
            send_new_post_alert(new_posts, agent)
    except Exception as e:

        print "{0} : Error {1}".format(agent.keywords.encode('utf-8'), e.args)
        print "{0} : Error {1}".format(agent.keywords.encode('utf-8'), e.message)


def clean_old_post():
    last_days = datetime.utcnow() - timedelta(days=DAYS_IN_PAST)
    print ("Clean old posts : last days  : " + str(last_days))
    old_posts = db.session.query(Post).filter(Post.post_retrieved_on <= last_days).all()
    for old_post in old_posts:
        db.session.delete(old_post)
        db.session.commit()
    print ("Clena old post : Deleted " + str(len(old_posts)) + " old posts.")


def send_new_post_alert(posts, agent):
    print " sending email to : " + agent.email
    with manage.app.app_context():
        send_email(agent.email, agent.keywords + ': ' + str(len(posts)) + ' new',
                   'auth/email/new_post_alert', posts=posts)

        manage.app.logger.info(
            "Email send to :" + agent.email + " for : " + agent.keywords + " : " + str(len(posts)) + " new posts.")
