from flask import Flask, request, session, make_response
from flask.json import jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Post, SubForum, get_uuid
from datetime import timedelta, datetime
from config import ApplicationConfig
import requests
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import any_, func, desc
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client('s3',
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_ACCESS_KEY'],
    region_name='us-east-2'
)

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app, supports_credentials=True, resources={r"*": {"origins": "*"}})

db.init_app(app)
with app.app_context():
    db.create_all()

#USE order_by() to fuck with how i want queries renderd. can use order_by(TABLE.column.desc()) for decending order

@app.route('/auth/register', methods=["POST"])
def register_uesr():
    email = request.json["email"].lower()
    username = request.json["username"].lower()
    pwd = request.json["sign_pwd"]  
    domain = email.split('@')[1]
    while domain.count('.') > 1:
        domain = domain[domain.index('.') + 1 :]

    user_exists = User.query.filter_by(email=email).first() is not None
    university = requests.get(("http://universities.hipolabs.com/search?domain={}").format(domain)).json()

    if not university:
        return jsonify({"error": "Error finding university"}), 401

    if user_exists:
        return jsonify({"error": "User already exists"}), 401

    uni_name = domain[:domain.index('.')]
    
    hashed_pwd = generate_password_hash(pwd)
    new_user = User(email=email, username=username, password=hashed_pwd, university=uni_name, university_full=university[0]["name"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "username": new_user.username,
        "uni": new_user.university
    })

@app.route('/auth/login', methods=["POST"])
def login_user():
    usermail = request.json["usermail"].lower()
    pwd = request.json["log_pwd"]

    if User.query.filter_by(email=usermail).first() is not None:
        user = User.query.filter_by(email=usermail).first()
    else: user = User.query.filter_by(username=usermail).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401
    if not check_password_hash(user.password, pwd):
        return jsonify({"error": "Unauthorized"}), 401
    
    res = jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "university": user.university
    })
    res.set_cookie('user_id', user.id, max_age=timedelta(days=7))

    return res

@app.route('/auth/logout', methods=["GET"])
def logout_user():
    res = make_response('200')
    res.delete_cookie('user_id')
    return res

@app.route('/@me', methods=['GET'])
def get_current_user():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthenticated"}), 418
    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        'id': user.id,
        "username": user.username,
        "email": user.email,
        "university": user.university,
        "authenticated": True
    })

@app.route("/userdata", methods=["POST"])
def get_data():
    query = request.json['username'].lower()
    user = User.query.filter_by(username=query).first()
    if user is None:
        return jsonify({"error": "User Not Found"}), 404
    user_id = request.cookies.get('user_id')
    posts = db.session.query(Post, SubForum).join(SubForum).filter(Post.user_id==query).filter(SubForum.is_public==True).filter(Post.is_comment==False).all()
    resp = []
    for post, sub in posts:
        if user_id in post.likes:
            liked = True
        else: liked = False
        if post.image_id is not None:
            pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": post.image_id}, ExpiresIn=60)
        else: pre_link=None
        resp.insert(0, {"id": post.id, "user": post.user_id, "title": post.title, "body": post.body, "media_link": pre_link, "media_id": post.image_id, "time": post.time,
            "likes": post.likes, 'liked':liked, "subforum":post.subforum, "sub_name": sub.title, "university": post.university})
    #return jsonify({'posts': resp})
    # return resp
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "university": user.university_full,
        "posts": resp
    })

@app.route("/uploadimage", methods=["POST"])
def upload_image():
    media = request.files['media'].stream
    name = get_uuid()
    s3.upload_fileobj(media, 'upost-content', name)
    return jsonify({"fileid":name})


@app.route("/makepost", methods=["POST"])
def make_post():
    post_data = request.json
    try:
        media = request.json['media']
        pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": media}, ExpiresIn=60)
    except KeyError: 
        media = None
        pre_link = None
        pass
    user_id = request.cookies.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthenticated"})
    username = User.query.filter_by(id=user_id).first().username
    sub_name = SubForum.query.filter_by(id=post_data['subforum']).first().title
    time_curr = datetime.now()
    new_post = Post(user_id=username, title=post_data['title'], body=post_data['body'], time=time_curr, subforum=post_data['subforum'], university=post_data["university"], image_id=media)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({
    "id": new_post.id,
    "user": new_post.user_id,
    "title": new_post.title,
    "body": new_post.body,
    "time": new_post.time,
    "likes": new_post.likes,
    "liked": False,
    "subforum": new_post.subforum,
    "sub_name": sub_name,
    'media_link': pre_link,
    "media_id": new_post.image_id
    })

@app.route("/makecomment", methods=["POST"])
def make_comment():
    post_data = request.json
    post = Post.query.filter_by(id=post_data['comment_on']).first()
    if post.index >= 5:
        # return jsonify({"error": "max comment recursion"})
        comment_on = post.comment_on
    else: comment_on = post_data['comment_on']
    try:
        media = request.json['media']
        pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": media}, ExpiresIn=60)
    except KeyError: 
        media = None
        pre_link = None
        pass
    user_id = request.cookies.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthenticated"})
    username = User.query.filter_by(id=user_id).first().username
    time_curr = datetime.now()
    comment = Post(is_comment=True, comment_on=comment_on, origin_id=post_data['origin_id'], user_id=username,
             body=post_data['body'], time=time_curr, subforum=post_data['subforum'], university=post_data["university"], image_id=media, index=(post.index + 1))
    db.session.add(comment)
    db.session.commit()
    post.comments.append(comment.id)
    flag_modified(post, "comments")
    db.session.merge(post)
    db.session.flush()
    db.session.commit()
    return jsonify({
    "id": comment.id,
    "user": comment.user_id,
    "body": comment.body,
    "time": comment.time,
    "likes": comment.likes,
    "liked": False,
    "subforum": comment.subforum,
    'media_link': pre_link,
    "media_id": comment.image_id,
    "comment_on": comment.comment_on,
    "origin_id": comment.origin_id,
    "comments": comment.comments,
    "num_comments": len(comment.comments),
    "index": comment.index
    })

@app.route("/getcomments", methods=["POST"])
def get_comments():
    user_id = request.cookies.get('user_id')
    comment_on = request.json['comment_on']
    comments = Post.query.filter_by(is_comment=True).filter_by(comment_on=comment_on).all()
    resp = []
    for comment in comments:
        if user_id in comment.likes:
            liked = True
        else: liked = False
        if comment.image_id is not None:
            pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": comment.image_id}, ExpiresIn=60)
        else: pre_link=None
        resp.insert(0, {"id": comment.id, "user": comment.user_id, "title": comment.title, "body": comment.body, "media_id": comment.image_id, "time": comment.time,
        "likes": comment.likes, "subforum":comment.subforum, "comment_on": comment.comment_on, "origin_id": comment.origin_id,
         "comments":comment.comments, "num_comments": len(comment.comments), "index": comment.index, "liked": liked, "media_link": pre_link, "media_id": comment.image_id})
    return resp

@app.route("/likepost", methods=["POST"])
def post_like():
    post_id = request.json['id']
    user_id = request.cookies.get('user_id')
    post = Post.query.filter_by(id=post_id).first()
    if post:
        if len(post.likes) == 0 or user_id not in post.likes:
            post.likes.append(user_id)
            flag_modified(post, "likes")
            db.session.merge(post)
            db.session.flush()
            db.session.commit()
            return jsonify({
                "likes": post.likes,
                "foo": user_id
            })
        elif len(post.likes) > 0:
            post.likes.remove(user_id)
            flag_modified(post, "likes")
            db.session.merge(post)
            db.session.flush()
            db.session.commit()
            return jsonify({"foo": "bar"})

@app.route("/getposts", methods=["POST"]) #FIGURE OUT HOW TO LOAD ONLY A CERTAIN AMOUNT OF POSTS PER PAGE
def get_posts():
    #quant = request.json['quantity']
    #start = request.json['start']
    subforum = request.json['subforum']
    uni = request.json['university']
    user_id = request.cookies.get('user_id')
    posts = Post.query.filter_by(subforum=subforum).filter_by(university=uni).filter_by(is_comment=False).all()
    sub_name = SubForum.query.filter_by(id=subforum).first().title
    resp = []
    for post in posts:
        if user_id in post.likes:
            liked = True
        else: liked = False
        if post.image_id is not None:
            pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": post.image_id}, ExpiresIn=60)
        else: pre_link=None
        resp.insert(0, {"id": post.id, "user": post.user_id, "title": post.title, "body": post.body, "media_link": pre_link, "media_id": post.image_id, "time": post.time,
            "likes": post.likes, 'liked':liked, "subforum":post.subforum, "sub_name": sub_name, "university": post.university})
    #return jsonify({'posts': resp})
    return resp

@app.route("/makeforum", methods=["POST"])
def make_forum():
    title = request.json['title'].lower()
    user_id = request.cookies.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthenticated"})
    user = User.query.filter_by(id=user_id).first()
    time_curr = datetime.now()
    new_forum = SubForum(user_id=user.id, university=user.university, title=title, time=time_curr, users=[user_id])
    db.session.add(new_forum)
    db.session.commit()
    user.subforums.append(new_forum.id)
    flag_modified(user, 'subforums')
    db.session.merge(user)
    db.session.flush()
    db.session.commit()

    return jsonify({
        "id": new_forum.id,
        "user": new_forum.user_id,
        "title": new_forum.title,
        "time": new_forum.time,
        "university": new_forum.university
    })

@app.route("/getownedforums", methods=["POST"]) #FIGURE OUT HOW TO LOAD ONLY A CERTAIN AMOUNT OF POSTS PER PAGE
def get_owned_forums():
    quant = request.json['quantity']
    start = request.json['start']
    user_id = request.cookies.get('user_id')
    subs = SubForum.query.filter_by(user_id=user_id).order_by(func.cardinality(SubForum.users)).all()
    resp = []
    for sub in subs:
        resp.insert(0, {"id": sub.id, "user": sub.user_id, "title": sub.title, "time": sub.time, "users": sub.users, "university": sub.university})
    #return jsonify({'posts': resp})
    return resp

@app.route("/getfollowedforums", methods=["POST"]) #FIGURE OUT HOW TO LOAD ONLY A CERTAIN AMOUNT OF POSTS PER PAGE
def get_followed_forums():
    quant = request.json['quantity']
    start = request.json['start']
    user_id = request.cookies.get('user_id')
    sub_ids = User.query.filter_by(id=user_id).first().subforums
    resp = []
    for sub in sub_ids:
        print(sub)
        subforum = SubForum.query.filter_by(id=sub).first()
        if subforum.user_id != user_id: resp.insert(0, {"id": subforum.id, "user": subforum.user_id, "title": subforum.title, "time": subforum.time,
         "users": subforum.users, "university": subforum.university})
    # return jsonify({'posts': resp})
    return resp
    

@app.route("/homeposts", methods=["POST"])
def home_posts():
    user_id = request.cookies.get("user_id")
    # post_count = request.json['post_count']
    page = request.json['page']
    user = User.query.filter_by(id=user_id).first()
    # posts = Post.query.filter_by(university=user.university).filter(Post.subforum.like(any_(user.subforums))).filter_by(is_comment=False).order_by(desc(Post.time)).limit(post_count).all()
    posts = Post.query.filter_by(university=user.university).filter(Post.subforum.like(any_(user.subforums))).filter_by(is_comment=False).order_by(desc(Post.time)).paginate(page=page, per_page=5)
    resp = []
    for post in posts:
        if user_id in post.likes:
            liked = True
        else: liked = False
        if post.image_id is not None:
            pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": post.image_id}, ExpiresIn=60)
        else: pre_link=None
        sub_name = SubForum.query.filter_by(id=post.subforum).first().title
        resp.append({"id": post.id, "user": post.user_id, "title": post.title, "body": post.body, "media_link": pre_link,
         "time": post.time, "likes": post.likes, 'liked':liked, "subforum":post.subforum, "sub_name": sub_name, "university": post.university, "page":page})
    return resp

@app.route("/switchforumpublic", methods=['POST'])
def switch_public():
    forum_id = request.json['id']
    forum = SubForum.query.filter_by(id=forum_id).first()
    if forum:
        forum.is_public = not forum.is_public
        flag_modified(forum, "is_public")
        db.session.merge(forum)
        db.session.flush()
        db.session.commit()
    else: return jsonify({"error": "foo"}), 418
    return jsonify({"success": "bar"})

@app.route("/followforum", methods=["POST"])
def follow_forum():
    forum_id = request.json['id']
    user_id = request.cookies.get('user_id')
    forum = SubForum.query.filter_by(id=forum_id).first()
    user = User.query.filter_by(id=user_id).first()
    if forum:
        if forum.is_public or user_id in forum.users:
            if user_id not in forum.users:
                forum.users.append(user_id)
                user.subforums.append(forum_id)
                flag_modified(forum, "users")
                flag_modified(user, "subforums")
                db.session.merge(forum, user)
                db.session.flush()
                db.session.commit()
                return jsonify({
                    "likes": forum.users,
                    "foo": user_id
                })
            else:
                forum.users.remove(user_id)
                user.subforums.remove(forum_id)
                flag_modified(forum, "users")
                flag_modified(user, "subforums")
                db.session.merge(forum, user)
                db.session.flush()
                db.session.commit()
                return jsonify({"foo": "bar"})
        else:
            if len(forum.pending_users) == 0 or user_id not in forum.pending_users:
                forum.pending_users.append(user_id)
                flag_modified(forum, "pending_users")
                db.session.merge(forum)
                db.session.flush()
                db.session.commit()
                return jsonify({
                    "foo": user_id
                })
            elif len(forum.pending_users) > 0:
                forum.pending_users.remove(user_id)
                flag_modified(forum, "pending_users")
                db.session.merge(forum)
                db.session.flush()
                db.session.commit()
                return jsonify({
                    "foo": user_id
                })

@app.route("/getforuminfo", methods=["POST"])
def get_forum_info():
    id = request.json['id']
    user_id = request.cookies.get('user_id')
    forum = SubForum.query.filter_by(id=id).first()
    if user_id in forum.users:
        followed = True
    else: followed = False
    if user_id in forum.pending_users:
        pending = True
    else: pending = False
    pending_resp = []
    for id in forum.pending_users:
        user = User.query.filter_by(id=id).first()
        pending_resp.insert(0, {"username": user.username, "id": id})
    return jsonify({"id": forum.id, "user": forum.user_id, "title": forum.title, "time": forum.time, "users": forum.users, 'followed':followed,
     "is_public": forum.is_public, "pending": pending, "pending_users": pending_resp})

@app.route("/getpostinfo", methods=["POST"])
def get_post_info():
    id = request.json['id']
    user_id = request.cookies.get('user_id')
    post = Post.query.filter_by(id=id).first()
    if user_id in post.likes:
        liked = True
    else: liked = False
    if post.image_id is not None:
        pre_link = s3.generate_presigned_url(ClientMethod="get_object", Params={"Bucket": 'upost-content', "Key": post.image_id}, ExpiresIn=60)
    else: pre_link=None
    sub_name = SubForum.query.filter_by(id=post.subforum).first().title
    return jsonify({"id": post.id, "user": post.user_id, "title": post.title, "body": post.body, "media_link": pre_link,
         "time": post.time, "likes": post.likes, 'liked':liked, "subforum":post.subforum, "sub_name": sub_name, "comments":post.comments, "university": post.university})

@app.route("/forumsearchfill", methods=["POST"])
def forum_search():
    query = request.json['query']
    university = request.json['university']
    subforums = db.session.query(SubForum, User).join(User).filter(SubForum.university==university).filter(SubForum.title.like(query + "%")).order_by(SubForum.users).all()
    resp = []
    for sub, user in subforums:
        resp.insert(0, {"id": sub.id, "user": sub.user_id, "username": user.username, "title": sub.title, "time": sub.time, "users": sub.users})
    return resp

@app.route("/forumresults", methods=["POST"])
def get_forum_results():
    query = request.json['query']
    university = request.json['university']
    user_id = request.cookies.get('user_id')
    subforums = SubForum.query.filter_by(university=university).filter(SubForum.title.like(query + "%")).order_by(func.cardinality(SubForum.users)).all() # .limit(n) before ".all()" to limit the number of results
    resp = []
    for sub in subforums:
        if user_id in sub.users:
            followed = True
        else: followed = False
        resp.insert(0, {"id": sub.id, "user": sub.user_id, "title": sub.title, "time": sub.time, "users": sub.users, "followed": followed})
    return resp

@app.route("/getuniversityinfo", methods=["POST"])
def get_uni_info():
    domain = request.json['university']
    university = requests.get(("http://universities.hipolabs.com/search?domain={}").format(domain+".edu")).json()
    return jsonify({
        "name":university[0]["name"],
        "university-info": university
    })

@app.route('/approvependinguser', methods=["POST"])
def approve_pending_user():
    forum_id = request.json['forum_id']
    user_id = request.json['user_id']
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "cannot find pending user"}), 401
    forum = SubForum.query.filter_by(id=forum_id).first()
    if user_id in forum.pending_users:
        forum.pending_users.remove(user_id)
        forum.users.append(user_id)
        user.subforums.append(forum_id)
        flag_modified(forum, 'pending_users')
        flag_modified(forum, 'users')
        flag_modified(user, 'subforums')
        db.session.merge(forum, user)
        db.session.flush()
        db.session.commit()
        return jsonify({"success": "user followed"}), 200
    else: return jsonify({"error": "cannot find pending user"}), 404

@app.route('/denypendinguser', methods=["POST"])
def deny_pending_user():
    forum_id = request.json['forum_id']
    user_id = request.json['user_id']
    forum = SubForum.query.filter_by(id=forum_id).first()
    if user_id in forum.pending_users:
        forum.pending_users.remove(user_id)
        flag_modified(forum, 'pending_users')
        db.session.merge(forum)
        db.session.flush()
        db.session.commit()
        return jsonify({"success": "user removed"}), 200
    else: return jsonify({"error": "cannot find pending user"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0", port="5000",debug=True)
