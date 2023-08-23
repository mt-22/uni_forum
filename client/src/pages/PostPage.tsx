import React, {Component, useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import httpClient from '../httpClient';
import { PostObject } from '../types';
import Header from './components/Header';
import MakeComment from './components/MakeComment';
import Post from './components/Post';
import Comment from './components/Comment';
import '../styles/postpage.css'

import { hostURL } from '../httpClient';

const PostPage = () => {
    const params = useParams();
    const [post, setPost] = useState<PostObject | null>(null);
    const [comments, setComments] = useState(Array)

    useEffect(() => {
        const fetchPost = async() => {
            try {
                const resp = await httpClient.post(hostURL + 'getpostinfo', {"id":params.postid});
                setPost(resp.data)
                if (resp.data.comments.length > 0) fetchComments(resp.data)
            }
            catch (error:any) {console.log(error)}
        }
        const fetchComments = async(p:any) => {
            try {
                    const commentResp = await httpClient.post(hostURL + 'getcomments', {
                    "comment_on": await p.id,
                    })
                    setComments(commentResp.data)
            }
            catch (error:any) {console.log(error)}
        }
        fetchPost()

    }, [])

    const comment_wall = (comments.length > 0) && comments.map((el:any) => {
        return (
            <div className="comment-wrapper" key={el.id}>
                <Comment commentInfo={el} />
            </div>
        )
    })

    const updateComments = (e:any) => {
        setComments([e, ...comments])
    }

  return (
    <div className='page'>
        <Header />
        <div className='front-wrapper post-page-wrapper'>            
            {post && <div className='post-wrapper'>
                <div className='post'>
                    <Post postInfo={post}/>
                </div>
            </div>}
            <div className='comment-wall-wrapper post'>
            {params.postid && <MakeComment func={updateComments} commentOn={params.postid}/>}
            {comment_wall}
            </div>
        </div>
    </div>
  )
}

export default PostPage