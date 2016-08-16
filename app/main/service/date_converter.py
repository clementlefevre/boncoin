import datetime

from sqlalchemy.exc import IntegrityError

from app import db

__author__ = 'ramon'

import re


def update_article(articles):
    for article in articles:
        article.date = date_converter(article.article_date)
    persist_date(articles)


def date_converter(url):
    date = re.split('-', url)[-3:]
    date = [int(dt) for dt in date]
    date = tuple(date[::-1])

    return datetime.date(*date)


def persist_date(articles):
    try:
        db.session.bulk_save_objects(articles)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        print('Could not save those articles')
