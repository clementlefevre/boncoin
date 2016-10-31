
Common problems by deploying Flask on Heroku									
									
RDS Db not accessible	Set backup to 0 day								
	Set new security group with two conditions : one with TCP range 5432 IP m: 0.0.0.0/0 and an other Postgres range 5432 IP 0.0.0.0/0								
									
Wigsi / Gunicorn error 	Add the ProcFile in the root of the project before push to heroku								
	"Adding a Procfile
Heroku needs to know what command to use to start the application. This command
is given in a special file called the Procfile. This file must be included in the top-level
folder of the application."								
	web: gunicorn manage:app								
Cedar / No building package error	Add a requirements.txt file in the root folder as it seems heroku does not read the one in the requirements folder								
DATABASE_URL	Heroku set by default this var and it is the same as the production/heroku config DB. Change the Config.py for this config to PRODUCTION_DATABASE_URL								
On Heroku, first push to remote, then heroku run python manage.py deploy, then heroku restart.									
									
Deploy shortcut	:

 git add . && git commit -m 'add' && git push heroku master && heroku run python manage.py deploy && heroku restart


1 - Create app

$ heroku create <appname>
Creating <appname>... done, stack is cedar
http://<appname>.herokuapp.com/ | git@heroku.com:<appname>.git


2 - Create DB:

$ heroku addons:add heroku-postgresql:hobby-dev


3 - Set env variable in dashboard

4 - Push project :

Do not forget to create am empty migrations/versions and add an empty .gitignore inside.

$ git push heroku master


5 - Deploy

$ heroku run python manage.py deploy

6 - Restart

$ heroku restart
