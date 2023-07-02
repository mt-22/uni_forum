from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(345), unique=True)
    username = db.Column(db.String(32), unique=True)
    password = db.Column(db.Text, nullable=False)
    university = db.Column(db.String(32))
    university_full = db.Column(db.String(256))
    subforums = db.Column(db.ARRAY(db.String(32)), default=[])
    
class SubForum(db.Model):
    __tablename__ = 'subforums'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey(User.id)) #MAYBE DO ID COLUMN FROM USERS INSTEAD-- BETTER METHOD FOR GETTING ALL USER INFO RATHER THAN JUST USERNAME
    title = db.Column(db.String(22))
    time = db.Column(db.Text)
    users = db.Column(db.ARRAY(db.String(32)), default=[])
    university = db.Column(db.String(32))
    is_public = db.Column(db.Boolean, default=True)
    pending_users = db.Column(db.ARRAY(db.String(32)), default=[])

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey(User.username))
    title = db.Column(db.Text)
    body = db.Column(db.Text)
    time = db.Column(db.Text)
    likes = db.Column(db.ARRAY(db.Text), default=[[]])
    subforum = db.Column(db.String(32), db.ForeignKey(SubForum.id))
    university = db.Column(db.String(32))
    image_id = db.Column(db.String(32))
    comments = db.Column(db.ARRAY(db.String(32)), default=[])
    is_comment = db.Column(db.Boolean, default=False)
    comment_on = db.Column(db.String(32), default=None)
    origin_id = db.Column(db.String(32), default=None)
    index = db.Column(db.Integer, default=0)

