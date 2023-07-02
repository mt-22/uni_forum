import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import httpClient, { hostURL } from '../../httpClient';
import { BlankPost } from '../../types';
import '../../styles/post.css'
import MakeComment from './MakeComment';


const Post = ({
    postInfo}:any

) => {
    const params = useParams();
    const post = postInfo
    const [likeCount, setLikes] = useState(postInfo.likes.length);
    const [isLiked, swapLiked] = useState(postInfo.liked);

    const add_like = async () => {
        try {
                await httpClient.post(hostURL + 'likepost', {"id":postInfo.id});
                if (!isLiked) {setLikes(likeCount+1)} else {setLikes(likeCount-1)};
                swapLiked(!isLiked);
        }
        catch (error) {console.log(error)}
    }
  return (
    <>
        <div className='post-userforum'>
            <a href={`/forums/${postInfo.university}/${postInfo.subforum}`} className="post-forum-title"><p>{postInfo.university}/{postInfo.sub_name}</p></a>
            <p className='post-user'>Posted By - <a href={`/users/${post.user}`} className='post-user'>{post.user}</a></p>
        </div>
        <div className="post-content">
            <a className="post-link" href={`/forums/${params.university}/${postInfo.subforum}/${post.id}`}>
                {post.title}
            </a>
            <p className='post-body'>{post.body}</p>
            <>{postInfo.media_link && <img className='post-image' src={postInfo.media_link}/>}</>
        </div>
        <div className='post-like-wrapper'>
            <p className="post-likes">Likes: {likeCount}</p>
            <button className="post-like-btn" onClick={() => add_like()}>Like</button>
        </div>
    </>
  )
}

export default Post