import sys
import os

# Add the current directory to sys.path so that imports work correctly
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app object. 
# cPanel's Phusion Passenger looks for an object named 'application' by default.
from flask_app import app as application
