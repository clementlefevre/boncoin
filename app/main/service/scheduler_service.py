import atexit
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from apscheduler.triggers.interval import IntervalTrigger

from app.main.service.posts_service import retrieve_url
from manage import app

__author__ = 'ramon'


logging.basicConfig()

scheduler = BackgroundScheduler()

period = 1


def start_scheduler():
    stop_scheduler()
    if not scheduler.running:
        scheduler.start()
    app.logger.info('Scheduler job has been started')
    add_job()

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())


def add_job():
    global scheduler
    log = logging.getLogger('apscheduler.executors.default')
    log.setLevel(logging.INFO)  # DEBUG

    
    scheduler.add_job(
    func=retrieve_url,
    trigger=IntervalTrigger(minutes=get_scheduler_period()),
    id='printing_job',
    name='Print date and time every ' + str(get_scheduler_period()) + 'minutes',
    replace_existing=True)

def stop_scheduler():
    if scheduler.state == "STATE_RUNNING":
        scheduler.remove_jobstore()
   
    app.logger.info('Scheduler job have been removed')


def set_scheduler_period(period_to_set):
    global period
    print period
    period = period_to_set
    print "Period is now " + str(period)
    stop_scheduler()
    add_job()


    start_scheduler()


def get_scheduler_period():
    global period

    if period is None:
        period = 5
    print "current Period is : " + str(period)
    return period


def get_scheduler_status():
    return scheduler.state