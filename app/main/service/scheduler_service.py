import atexit
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from apscheduler.triggers.interval import IntervalTrigger

from app.main.service.posts_service import retrieve_url, clean_old_post
from app.models import PeriodManager
import manage

__author__ = 'ramon'

logging.basicConfig()

scheduler = BackgroundScheduler()

periodManager = PeriodManager(10, 60 * 24)


def scheduler_status(function):
    def wrapper():
        print "before : " + function.__name__ + " : " + str(scheduler.state)
        function()
        print "after : " + function.__name__ + " : " + str(scheduler.state)

    return wrapper


@scheduler_status
def start_scheduler():
    if scheduler.state == 0:
        scheduler.start()
        # manage.app.logger.info('Scheduler job has been started')
        add_job_scraper()
        add_job_cleaner()

        # Shut down the scheduler when exiting the app
        atexit.register(lambda: scheduler.shutdown())
    if scheduler.state == 2:
        scheduler.resume()
        manage.app.logger.info('Scheduler job has been resumed')


@scheduler_status
def stop_scheduler():
    if scheduler.state == 1:
        scheduler.pause()
        manage.app.logger.info('Scheduler job have been stopped')


def add_job_scraper():
    log = logging.getLogger('apscheduler.executors.default')
    log.setLevel(logging.INFO)
    scheduler.add_job(
        func=retrieve_url,
        trigger=IntervalTrigger(minutes=periodManager.scraper_period),
        id='scraping_job',
        name='scrap the web every ' + str(periodManager.scraper_period) + ' minutes',
        replace_existing=True)


def add_job_cleaner():
    log = logging.getLogger('apscheduler.executors.default')
    log.setLevel(logging.INFO)
    scheduler.add_job(
        func=clean_old_post,
        trigger=IntervalTrigger(minutes=periodManager.cleaner_period),
        id='cleaning_job',
        name='clean DB for olds posts every ' + str(periodManager.cleaner_period) + ' minutes',
        replace_existing=True)


def set_scheduler_period(period_to_set):
    periodManager.scraper_period = period_to_set
    add_job_scraper()


def get_scheduler_period():
    return periodManager.scraper_period


def get_scheduler_status():
    return scheduler.state


start_scheduler()
