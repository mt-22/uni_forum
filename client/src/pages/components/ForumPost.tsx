import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import httpClient from '../../httpClient';
import { BlankPost } from '../../types';
import PostLike from './PostLike';

import { hostURL } from '../../httpClient';

const ForumPost = ({
    postInfo}:any

) => {
    const params = useParams();
    const [post, setPost] = useState(BlankPost)
    const [likeCount, setLikes] = useState(Number);
    const [isLiked, swapLiked] = useState(Boolean);

    useEffect(() => {
        const fetch = async () => {
            try {
                const rep = await httpClient.post(hostURL + 'getpostinfo', {
                    "id": postInfo.id
                });
                setPost(rep.data)
                setLikes(rep.data.likes.length)
                swapLiked(rep.data.liked)
                console.log(isLiked)
            } catch (error) {
            }
        };
        fetch();
    }, []);

    const add_like = async () => {
        try {
                console.log(isLiked)
                const resp = await httpClient.post(hostURL + 'likepost', {"id":postInfo.id});
                if (!isLiked) {setLikes(likeCount+1)} else {setLikes(likeCount-1)};
                swapLiked(!isLiked);
        }
        catch (error) {console.log(error)}
    }

  return (
    <div key={post.id}>
        <a href={`/users/${post.user}`}><p>{post.user}</p></a>
        <Link to={`/forums/${params.university}/${params.subforum}/${post.id}`}>
            <h1>{post.title}</h1>
        </Link>
        <p>{post.body}</p>
        <p>Likes: {likeCount}</p>
        <button onClick={() => add_like()}>Like</button>
    </div>
  )
}

export default ForumPost