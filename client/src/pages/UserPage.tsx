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
    const [curPage, setCurPage] = useState(1)
    const [pages, setPages] = useState(Array);
    useEffect(() => {
        const fetch = async() => {
            try {
                setLoading(true)
                const resp = await httpClient.post(hostURL + "userdata", {
                    "username": params.username,
                    "page": curPage
                });
                setUser(resp.data)
                setPages([...pages, resp.data.posts])
                setLoading(false)
            }
            catch (error:any) {
                console.log(error)
            }
        }
        fetch();
    }, [curPage]);

    const page_wall = pages.map((el: any) => {
        const post_wall = el.map((po: any) => {
            return (
                <article className='post' key={po.id}>
                    <Post postInfo={po}/>
                </article>
            )
        })
        return (
            <div className='post-wall-page'>
                {post_wall}
            </div>
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
        {(!isLoading || pages.length > 0) && 
        <>
            <div className='user-info'>
                <h1>{user.username}</h1>
                <p>{user.university}</p>
            </div>
            {page_wall}
            <button onClick={() => setCurPage(curPage+1)}>Load More</button>
        </>}
        </div>
    </div>
  )
}

export default UserPage