import calendar
import re

from dateutil import parser

from sqlalchemy import func

from app import db
from app.models import Image, Article

__author__ = 'ramon'


def find_images(form):
    fromDate = parser.parse(form['date_from'])
    toDate = parser.parse(form['date_to'])

    caption = form['caption']
    # ipdb.set_trace()
    images = []

    # articles = db.session.query(Article).filter(Article.date >= fromDate, Article.date <= toDate).all()
    # # images = db.session.query(Image).with_parent(articles).all()
    # for article in articles:
    #     found_images = (db.session.query(Image).with_parent(article).all())
    #     if len(found_images) > 0:
    #         images.extend(found_images)
    images = db.session.query(Image).join(Article, Article.id == Image.article_id).filter(Article.date >= fromDate,
                                                                                          Article.date <= toDate).filter(
        func.lower(Image.image_caption).contains(caption.lower())).group_by(
        Image.image_hash).all()

    result = [dictionify(image) for image in images]

    return result


def find_images_by_name(name):
    images = db.session.query(Image).join(Article, Article.id == Image.article_id).filter(
        func.lower(Image.image_caption).contains(name.lower())).group_by(
        Image.image_hash).all()

    result = [dictionify(image) for image in images]

    return result


def dictionify(image):
    return dict(image_hash=image.image_hash, image_url=image.image_link, image_caption=image.image_caption,
                date=calendar.timegm(image.articles.date.timetuple()) * 1000, article_url=image.articles.article_link,
                article_title=strip_title(image.articles.article_link))


def strip_title(url):
    result = re.findall('/.*/(.*?)html', url)[0]
    result = result.replace('-', ' ')
    return result
