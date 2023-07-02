import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import httpClient from '../httpClient';
import Header from './components/Header';

import { hostURL } from '../httpClient';
import Post from './components/Post';
import '../styles/user.css'

const UserPage = () => {
    const params = useParams();
    const [user, setUser] = useState(Object)
    const [posts, setPosts] = useState(Array)
    const [isLoading, setLoading] = useState(Boolean)
    useEffect(() => {
        const fetch = async() => {
            try {
                setLoading(true)
                const resp = await httpClient.post(hostURL + "userdata", {
                    "username": params.username
                });
                setUser(resp.data)
                setPosts(resp.data.posts)
                setLoading(false)
            }
            catch (error:any) {
                console.log(error)
            }
        }
        fetch();
    }, []);

    const post_wall = (posts.length > 0) && posts.map((el: any) => {
        return (
            <article className="post" key={el.id}>
                <Post postInfo={el}/>
            </article>
        )
    })
  return (
    // <div>
    //     <Header/>
    //     <h1>{user.username}</h1>
    //     <p>{user.university}</p>
    //     {post_wall}
    // </div>
    <div className='page'>
    <Header />
    <div className='front-wrapper post-page-wrapper forum-page'>
        {!isLoading && 
        <>
            <div className='user-info'>
                <h1>{user.username}</h1>
                <p>{user.university}</p>
            </div>
            {post_wall}
        </>}
        </div>
    </div>
  )
}

export default UserPage