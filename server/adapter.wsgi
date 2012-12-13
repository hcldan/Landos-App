
import sys, os, bottle

sys.path = ['/var/www/Landos-App/server'] + sys.path
os.chdir(os.path.dirname(__file__))

import server

application = bottle.default_app()
