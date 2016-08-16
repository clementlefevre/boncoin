from flask.ext.wtf import Form
from wtforms import SubmitField, StringField
from wtforms.fields.html5 import DateField


class DateRangeForm(Form):
    date_from = DateField('From', format='%Y-%m-%d')
    date_to = DateField('To', format='%Y-%m-%d')
    author = StringField('Author')
    submit = SubmitField('Search images')
