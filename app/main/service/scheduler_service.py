import atexit
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from apscheduler.triggers.interval import IntervalTrigger

from app.main.service.posts_service import retrieve_url,clean_old_post
from manage import app

__author__ = 'ramon'


logging.basicConfig()

scheduler = BackgroundScheduler()

period_scrap_mn = 1

period_clean_mn = 1


def start_scheduler():
    stop_scheduler()
    if not scheduler.running:
        scheduler.start()
    app.logger.info('Scheduler job has been started')
    add_job_scraper()
    add_job_cleaner()

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())


def add_job_scraper():
    global scheduler
    log = logging.getLogger('apscheduler.executors.default')
    log.setLevel(logging.INFO)  # DEBUG
    scheduler.add_job(
    func=retrieve_url,
    trigger=IntervalTrigger(minutes=get_scheduler_period()),
    id='scraping_job',
    name='scrap the web every ' + str(get_scheduler_period()) + 'minutes',
    replace_existing=True)

def add_job_cleaner():
    
    log = logging.getLogger('apscheduler.executors.default')
    log.setLevel(logging.INFO)  # DEBUG
    scheduler.add_job(
    func=clean_old_post,
    trigger=IntervalTrigger(minutes=period_clean_mn),
    id='cleaning_job',
    name='clean DB for olds posts every ' + str(period_clean_mn) + 'minutes',
    replace_existing=True)

def stop_scheduler():
    if scheduler.state == "STATE_RUNNING":
        scheduler.remove_jobstore()
   
    app.logger.info('Scheduler job have been removed')


def set_scheduler_period(period_to_set):
    global period
    print period
    period_scrap_mn = period_to_set
    print "Period is now " + str(period_scrap_mn)
    stop_scheduler()
    add_job()

    start_scheduler()


def get_scheduler_period():
    global period_scrap_mn

    if period_scrap_mn is None:
        period_scrap_mn = 5
    print "current Period is : " + str(period_scrap_mn)
    return period_scrap_mn


def get_scheduler_status():
    return scheduler.state