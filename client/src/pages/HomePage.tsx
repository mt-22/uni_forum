import React, { useEffect, useState } from 'react'
import httpClient from '../httpClient';
import ForumSearch from './components/ForumSearch';
import Post from './components/Post';
import LogoutButton from './components/LogoutButton';
import MakeSubForum from './components/MakeSubForum';
import Header from './components/Header';
import { useParams } from 'react-router-dom';
import '../styles/home.css'

import { hostURL } from '../httpClient';


//EXAMPLE OF CREATING A DYNAMIC ROUTES IN REACT
//CREATE NEW TABLE AND API FOR ACCESS/INPUTTING TABLE DATA
//QUERY FOR POSTS BY A POST ID + USERNAME
//POSSIBLT USE DATETIME FOR A TIMED REFRESH RATE FOR COMMENTS AND SUCH
const HomePage = () => {
    const [posts, setPosts] = useState(Array);
    const params = useParams();
    const [universityInfo, setUniversityInfo] = useState(Object)
    const [isLoading, setLoading] = useState(false)
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true)
                const resp = await httpClient.get(hostURL + 'homeposts');
                setPosts(resp.data);
                const uniresp = await httpClient.post(hostURL + 'getuniversityinfo', {
                    "university": params.university
                });
                setUniversityInfo(uniresp.data);
                setLoading(false)
            } catch (error) {
            }
        };
        fetch();

    }, []);
    

    const post_wall = posts.map((el: any) => {
        return (
            <article className='post' key={el.id}>
                <Post postInfo={el}/>
            </article>
        )
    })

    return (
        <div className='page'>
            <Header/>
                <div className='front-wrapper post-page-wrapper'>
                    {!isLoading && <><h1 className='uni-name'>{universityInfo.name}</h1>
                    <MakeSubForum/>
                    <h1 className='home-title'>Home</h1>
                        <>
                            {post_wall}
                        </></>}
                </div>
        </div>
    )
}

export default HomePage