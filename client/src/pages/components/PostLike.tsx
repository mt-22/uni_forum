import React, { useState } from 'react'
import { useParams } from 'react-router-dom';
import httpClient from '../../httpClient';

const hostURL = "//localhost:5000/"

const PostLike = ({likes, id, liked}:any) => {
    const params = useParams();
    const [likeCount, setLikes] = useState(likes);
    const [isLiked, swapLiked] = useState(liked)

    const add_like = async () => {
        try {
            if (!isLiked) {
                await httpClient.post(hostURL + 'addpostlike', {"id":id});
                setLikes(likeCount+1);
                swapLiked(true);
            } else {
                await httpClient.post(hostURL + 'removepostlike', {"id":id});
                setLikes(likeCount-1);
                swapLiked(false);
            }
        }
        catch (error) {console.log(error)}
    }
  return (
    <div key={id}>
        <p>Likes: {likeCount}</p>
        <button onClick={() => add_like()}>Like</button>
    </div>
  )
}

export default PostLike