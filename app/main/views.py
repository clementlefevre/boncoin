from flask import render_template, abort, request, \
    current_app, jsonify
from flask.ext.login import login_required
from flask.ext.sqlalchemy import get_debug_queries

from . import main
from  app.main.service.search_agents_service import start_scheduler
from app.models import User


@main.after_app_request
def after_request(response):
    for query in get_debug_queries():
        if query.duration >= current_app.config['FLASKY_SLOW_DB_QUERY_TIME']:
            current_app.logger.warning(
                'Slow query: %s\nParameters: %s\nDuration: %fs\nContext: %s\n'
                % (query.statement, query.parameters, query.duration,
                   query.context))
    return response


@main.route('/shutdown')
def server_shutdown():
    if not current_app.testing:
        abort(404)
    shutdown = request.environ.get('werkzeug.server.shutdown')
    if not shutdown:
        abort(500)
    shutdown()
    return 'Shutting down...'


@main.route('/user/<username>')
def user(username):
    user = User.query.filter_by(username=username).first_or_404()

    return render_template('user.html', user=user)


@main.route('/', methods=['GET', 'POST'])
@login_required
def index():
    return render_template('index.html')


@main.route('/test/', methods=['GET', 'POST'])
def test():
    start_scheduler()


@main.route('/search_agents/', methods=['GET', 'POST'])
def get_search_agents():
    if request.method == 'POST':
        new_keyword = request.json['keywords']
        # create_new_search_agent(new_keyword)

    else:
        results = get_all_agents()
        return jsonify(result=results), 200
