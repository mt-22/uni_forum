import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import httpClient from '../httpClient';
import Header from './components/Header';
import Post from './components/Post';
import '../styles/forumpage.css'
import MakePost from './components/MakePost';

import { hostURL } from '../httpClient';
import { Button } from 'react-bootstrap';


//EXAMPLE OF CREATING A DYNAMIC ROUTES IN REACT
//CREATE NEW TABLE AND API FOR ACCESS/INPUTTING TABLE DATA
//QUERY FOR POSTS BY A POST ID + USERNAME
//POSSIBLT USE DATETIME FOR A TIMED REFRESH RATE FOR COMMENTS AND SUCH
const ForumPage = () => {
    const [posts, setPosts] = useState(Array);
    const [forum, setForum] = useState(Object)
    const [followCount, setFollows] = useState(Number);
    const [isFollowed, swapFollowed] = useState(Boolean);
    const [isLoading, setLoading] = useState(false)
    const [userInfo, setUserInfo] = useState(Object)
    const params = useParams();
    const [isPublic, switchPublic] = useState(Boolean)
    const [pending, setPending] = useState(Boolean)
    const [pendingUsers, setPendingUsers] = useState(Number)
    const [curPage, setCurPage] = useState(1)
    const [pages, setPages] = useState(Array);
    useEffect(() => {
        const get_me = async () => {
            try {
                setLoading(true)
                const resp = await httpClient.get(hostURL + '@me');
                setUserInfo(resp.data)
                setLoading(false)
            }
            catch (error) {console.log(error)}
        }
        const fetch = async () => {
            try {
                setLoading(true)
                const forumInfo = await httpClient.post(hostURL + 'getforuminfo', {"id": params.subforum});
                setForum(forumInfo.data);
                setFollows(forumInfo.data.users.length)
                swapFollowed(forumInfo.data.followed)
                setLoading(false)
                switchPublic(forumInfo.data.is_public)
                setPending(forumInfo.data.pending)
                setPendingUsers(forumInfo.data.pending_users.length)
                if (pending && isPublic) {follow()}
                const resp = await httpClient.post(hostURL + 'getposts', {
                    //"quantity": 20,
                    //"start": 0,
                    "page": curPage,
                    "subforum": params.subforum,
                    "university": params.university
                });
                setPages([...pages, resp.data])
            } catch (error) {console.log(error)}
        };
        fetch();
        get_me();
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

    const follow = async () => {
        if (isPublic || isFollowed) {
            try {
                    const resp = await httpClient.post(hostURL + 'followforum', {"id":forum.id});
                    if (!isFollowed) {setFollows(followCount+1)} else {setFollows(followCount-1)};
                    swapFollowed(!isFollowed);
            }
            catch (error) {console.log(error)}
        } else {
            try {
            console.log(pending, "before")
            await httpClient.post(hostURL + 'followforum', {"id":forum.id});
            setPending(!pending)
            }
            catch(error) {console.log(error)}
        }
    }

    const updatePosts = (e:any) => {
        setPosts([e, ...posts])
    }

    const privateSwitch = async() => {
        switchPublic(!isPublic)
        try {
            await httpClient.post(hostURL + 'switchforumpublic', {"id": forum.id})
        }
        catch(error) {console.log(error)}
    }

    return (
        <div className='page'>
        <Header />
        <div className='front-wrapper post-page-wrapper forum-page'>
            {(!isLoading || pages.length > 0)? <>
                <div className="forum-page-info">
                    <div className='forum-name-users'>
                        <h1 className='forum-name'>{params.university}/{forum.title}</h1>
                        <div className="forum-follow-wrapper">
                            <p>{followCount} Users</p>
                            {!isPublic && forum.user == userInfo.id && forum && <a className="pending-btn" href={`${forum.id}/pending`}>{pendingUsers} Pending</a>}
                            {isPublic? <>{forum.user != userInfo.id && <Button className="red-btn" onClick={() => follow()}>{isFollowed? "Leave" : "Join"}</Button>}</> :
                            <>{forum.user != userInfo.id && <Button className="red-btn" onClick={() => follow()}>{pending? "Unrequest" : "Request"}</Button>}</>}
                        </div>
                    </div>
                    {forum && forum.user == userInfo.id && <>
                    <label id='private-label'>{!isPublic ? 
                    <>
                    Private
                    <div id="private-btn-wrapper" onClick={privateSwitch}>
                        <div className="private-btn-front private-btn-right"></div>
                    </div></>:
                    <>
                    Public
                    <div id="private-btn-wrapper" onClick={privateSwitch}>
                        <div className="private-btn-front priate-btn-left"></div>
                    </div></>}</label>
                    </>}
                </div>
                {isFollowed || isPublic ? <>
                <MakePost func={updatePosts}/>
                    <>
                        {page_wall}
                        <button onClick={() => setCurPage(curPage+1)}>Load More</button>
                    </>
                </>:
                <h1>This is a private forum</h1>}
            </>:<div></div>}
            </div>
        </div>
    )
}

export default ForumPage