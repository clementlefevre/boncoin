import os
import smtplib


def send_mail_smtp(title, value):
    server = smtplib.SMTP('smtp.world4you.com', 587)
    server.starttls()
    server.login(os.getenv('MAIL_USERNAME'), os.getenv('MAIL_PASSWORD'))
    message = 'Subject: %s\n\n%s' % (title, value)
    msg = "\r\n".join([
        "From: " + os.getenv('MAIL_USERNAME'),
        "To: " + "clement.san@gmail.com",
        "Subject: Just a message",
        "",
        "Why, oh why"
    ])
    server.sendmail(os.getenv('MAIL_USERNAME'), "clement.san@gmail.com", msg)
    server.quit()
