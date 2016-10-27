from flask import render_template, abort, request, \
    current_app, jsonify
from flask.ext.login import login_required
from flask.ext.sqlalchemy import get_debug_queries

from . import main
from app.main.service import search_agent_service
from  app.main.service.scheduler_service import start_scheduler, stop_scheduler, set_scheduler_period, \
    get_scheduler_period,get_scheduler_status
from app.main.service.search_agent_service import create_search_agent, get_search_agent, exists, delete_search_agent
from app.models import User, SearchAgent
from app.main.service.posts_service import retrieve_url


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


@main.route('/start_scheduler/', methods=['GET'])
def start_crawler():
    start_scheduler()
    return ('', 204)


@main.route('/stop_scheduler/', methods=['GET'])
def stop_crawler():
    stop_scheduler()
    return ('', 204)

@main.route('/scheduler_status/', methods=['GET'])
def get_crawler_status():
    return jsonify(status = get_scheduler_status())


@main.route('/retrieve_url/', methods=['GET'])
def retrieve_url_manually():
    retrieve_url()
    return ('', 204)
    


@main.route('/scheduler_period/', methods=['GET', 'POST'])
def set_crawler_period():
    if request.method == 'POST':

        if not request.json or request.json['period'] < 1:
            abort(400)
        period = request.json['period']
        set_scheduler_period(period)
    else:
        period = get_scheduler_period()
        return jsonify(period=period)

    return return_agents()


@main.route('/search_agents/', methods=['GET', 'POST'])
def get_search_agents():
    if request.method == 'POST':

        if not request.json or 'keywords' not in request.json:
            abort(400)
        new_search_agent = {
            'email': request.json['email'],
            'keywords': request.json['keywords'].lower(),
            'min_price': request.json['min_price'],
            'is_active': request.json['is_active'],

        }
        new_search_agent = SearchAgent(**new_search_agent)
        if not exists(new_search_agent):
            create_search_agent(new_search_agent)

    return return_agents()


@main.route('/delete_search_agent/', methods=['POST'])
def delete_search_agents():
    if request.method == 'POST':
        print request.json
        if not request.json or 'keywords' not in request.json:
            abort(400)
        search_agent_to_remove = agent_to_dict(request)

        if exists(search_agent_to_remove):
            delete_search_agent(search_agent_to_remove)

    return return_agents()


@main.route('/activate_search_agent/', methods=['POST'])
def activate_search_agent():
    if request.method == 'POST':
        print request.json
        if not request.json or 'keywords' not in request.json:
            abort(400)
        search_agent = agent_to_dict(request)

        if exists(search_agent):
            search_agent_service.activate_search_agent(search_agent)

    return return_agents()



def agent_to_dict(request):
    search_agent = {
        'id': request.json['id'],
        'email': request.json['email'],
        'keywords': request.json['keywords'],
        'min_price': request.json['min_price'],
        'is_active': request.json['is_active'],

    }
    return SearchAgent(**search_agent)


def return_agents():
    results = get_search_agent()
    results = [r.serialize() for r in results]
    return jsonify(result=results), 200
