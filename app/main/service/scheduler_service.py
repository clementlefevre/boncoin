import atexit
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from apscheduler.triggers.interval import IntervalTrigger

from app.main.service.post_crawler_service import retrieve_url
from manage import app

__author__ = 'ramon'

log = logging.getLogger('apscheduler.executors.default')
log.setLevel(logging.INFO)  # DEBUG

fmt = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
h = logging.StreamHandler()
h.setFormatter(fmt)
log.addHandler(h)

scheduler = BackgroundScheduler()

period = 20


def start_scheduler():
    stop_scheduler()
    if not scheduler.running:
        scheduler.start()
    app.logger.info('Scheduler job has been started')
    scheduler.add_job(
        func=retrieve_url,
        trigger=IntervalTrigger(minutes=get_scheduler_period()),
        id='printing_job',
        name='Print date and time every five ' + str(get_scheduler_period()) + 'minutes',
        replace_existing=True)
    app.logger.info(scheduler.state)
    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())


def stop_scheduler():
    if scheduler.state == "STATE_RUNNING":
        scheduler.remove_jobstore()
    app.logger.info('Scheduler job have been removed')


def set_scheduler_period(period_to_set):
    global period
    print period
    period = period_to_set
    print "Period is now " + str(period)
    if scheduler.state == "STATE_RUNNING":
        scheduler.remove_jobstore()

    scheduler.add_job(
        func=retrieve_url,
        trigger=IntervalTrigger(minutes=get_scheduler_period()),
        id='printing_job',
        name='Print date and time every five seconds',
        replace_existing=True)
    app.logger.info(scheduler.state)
    start_scheduler()


def get_scheduler_period():
    global period

    if period is None:
        period = 5
    print "current Period is : " + str(period)
    return period
