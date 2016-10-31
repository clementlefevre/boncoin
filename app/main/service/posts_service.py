# coding: utf8
#
from datetime import datetime, timedelta

import manage
from app import db
from app.main.service.search_agent_service import get_search_agent
from scraper_service import retrieve_description, convert_to_post
from app.models import Post
from app.email import send_email

DAYS_IN_PAST = 10


def retrieve_url():
    with manage.app.app_context():

        agents = get_search_agent()
        active_agents = [x for x in agents if x.is_active]
        for agent in active_agents:
            try:
                posts_raw = retrieve_description(agent)
                post_objects = convert_to_post(posts_raw)
                filter_on_new(post_objects, agent)
            except:
                manage.app.logger.exception(agent.keywords)


def filter_on_new(posts, agent):
    new_posts = []
    posts_price_ok = [post for post in posts if (post.post_price >= agent.min_price or post.post_price < 0)]
    for post in posts_price_ok:
        q = db.session.query(Post).filter(Post.post_url == post.post_url).all()
        if len(q) < 1:
            new_posts.append(post)

    if len(new_posts) > 0:
        for new_post in new_posts:
            db.session.add(new_post)
            db.session.commit()
        send_new_post_alert(new_posts, agent)


def clean_old_post():
    last_days = datetime.utcnow() - timedelta(days=DAYS_IN_PAST)
    manage.app.logger.info("last days  : " + str(last_days))
    old_posts = db.session.query(Post).filter(Post.post_retrieved_on <= last_days).all()
    for old_post in old_posts:
        db.session.delete(old_post)
        db.session.commit()
    manage.app.logger.info("Deleted " + str(len(old_posts)) + " old posts.")


def send_new_post_alert(posts, agent):
    print " sending email to : " + agent.email
    send_email(agent.email, agent.keywords + ': ' + str(len(posts)) + ' new',
               'auth/email/new_post_alert', posts=posts)

    manage.app.logger.info(
        "Email send to :" + agent.email + " for : " + agent.keywords + " : " + str(len(posts)) + " new posts.")
