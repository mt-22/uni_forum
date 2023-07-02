import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import httpClient, { hostURL } from '../../httpClient'
import { BlankPost } from '../../types'
import MakeComment from './MakeComment'
import '../../styles/postpage.css'

const Comment:React.FC<{commentInfo:any}> = ({commentInfo}) => {
    const [show, setShow] = useState(false)
    const [comments, setComments] = useState(Array)
    const [numComments, setNumComments] = useState(0)

    useEffect(() => {
      const fetch = async() => {
          try {
              const resp = await httpClient.post(hostURL + 'getcomments', {
                'comment_on':commentInfo.id,
                // "comment_index": commentInfo.index,
                // "max_index": 11
              })
              setComments(resp.data)
              setNumComments(resp.data.length)
          }
          catch(error) {console.log(error)}
      }
      if (commentInfo.num_comments > 0) fetch()
    }, [])

    const updateComments = (e:any) => {
        setComments([e, ...comments])
        setNumComments(numComments+1)
        setShow(false)
    }

    const comment_wall = (numComments > 0) && comments.map((el:any) => {
      return (
          <div className="comment-wrapper" key={el.id}>
            <Comment commentInfo={el}/>
          </div>
      )
  })
  const [likeCount, setLikes] = useState(commentInfo.likes.length);
  const [isLiked, swapLiked] = useState(commentInfo.liked);
  const add_like = async () => {
    try {
            await httpClient.post(hostURL + 'likepost', {"id":commentInfo.id});
            if (!isLiked) {setLikes(likeCount+1)} else {setLikes(likeCount-1)};
            swapLiked(!isLiked);
    }
    catch (error) {console.log(error)}
}
  return (
    <div>
        {/* <p>{commentInfo.body}</p>
        <button onClick={() => setShow(!show)}>Comment</button>
        {show && <MakeComment func={updateComments} commentOn={commentInfo.id}/>}
        {comment_wall} */}
        <div className='post-userforum'>
            <p className='post-user'><a href={`/users/${commentInfo.user}`} className='post-user'>{commentInfo.user}</a></p>
        </div>
        <div className="post-content">
            <p className='post-body'>{commentInfo.body}</p>
            <>{commentInfo.media_link && <img className='post-image' src={commentInfo.media_link}/>}</>
        </div>
        <div className='post-like-wrapper'>
            <p className="post-likes">Likes: {likeCount}</p>
            <button className="post-like-btn" onClick={() => add_like()}>Like</button>
        </div>
        <button onClick={() => setShow(!show)}>Comment</button>
        {show && <MakeComment func={updateComments} commentOn={commentInfo.id}/>}
        {commentInfo.index > 11? <div className='comment-wall-max'>{comment_wall}</div> : <div className='comment-wall'>{comment_wall}</div>}
        {/* <div className='post-like-wrapper'>
            <p className="post-likes">Likes: {likeCount}</p>
            <button className="post-like-btn" onClick={() => add_like()}>Like</button>
        </div> */}
    </div>
  )
}

export default Comment