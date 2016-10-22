__author__ = 'ramon'

from app import db
from app.models import SearchAgent


def get_search_agent():
    q = db.session.query(SearchAgent).all()
    db.session.expunge_all()
    return q


def exists(search_agent):
    q = db.session.query(SearchAgent).filter(SearchAgent.keywords == search_agent.keywords).all()
    return len(q) > 0


def create_search_agent(new_search_agent):
    db.session.add(new_search_agent)
    db.session.commit()


def delete_search_agent(search_agent_to_remove):
    agent_to_remove = db.session.query(SearchAgent).filter(SearchAgent.id == search_agent_to_remove.id).first()
    db.session.delete(agent_to_remove)
    db.session.commit()


def activate_search_agent(search_agent):
    agent = db.session.query(SearchAgent).filter(SearchAgent.id == search_agent.id).first()
    if search_agent.is_active:
        agent.is_active = False
    else:
        agent.is_active = True

    db.session.commit()
