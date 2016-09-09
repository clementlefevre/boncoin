import os
import smtplib
from threading import Thread

from flask import current_app, render_template
from flask.ext.mail import Message

from . import mail


def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)


def send_email(to, subject, template, **kwargs):
    app = current_app._get_current_object()

    msg = Message(app.config['FLASKY_MAIL_SUBJECT_PREFIX'] + ' ' + subject,
                  sender=app.config['FLASKY_MAIL_SENDER'], recipients=[to])
    msg.body = render_template(template + '.txt', **kwargs)
    msg.html = render_template(template + '.html', **kwargs)

    thr = Thread(target=send_async_email, args=[app, msg])
    thr.start()

    return thr


def send_mail_smtp(title, value):
    server = smtplib.SMTP('smtp.world4you.com', 587)
    server.starttls()
    print os.getenv('MAIL_USERNAME'), os.getenv('MAIL_PASSWORD')
    server.login(os.getenv('MAIL_USERNAME'), os.getenv('MAIL_PASSWORD'))
    message = 'Subject: %s\n\n%s' % (title, value)
    server.sendmail("flask.admin@lefevre.at", "clement.san@gmail.com", message)
    server.quit()
