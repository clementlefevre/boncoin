# coding: utf8
#
import sys
import logging
from app import db
from manage import app

from app.main.service.search_agent_service import get_search_agent
from scraper_service import retrieve_description,convert_to_post
from app.models import Post

from app.email import send_email


def retrieve_url():
    try:
        with app.app_context():
            agents = get_search_agent()
            active_agents = [x for x in agents if x.is_active]
            for agent in active_agents:
                posts_raw = retrieve_description(agent)
                post_objects = convert_to_post(posts_raw)
                filter_on_new(post_objects, agent)
    except :
        print sys.exc_info()[0]


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


def find_post(post_id):
    return db.session.query(Post).get(post_id)



def send_new_post_alert(posts, agent):
    print agent.email
    print agent.keywords
    send_email(agent.email, agent.keywords + ': ' + str(len(posts)) + ' new',
               'auth/email/new_post_alert', posts=posts)