import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import httpClient from '../httpClient';
import validator from 'validator';
import LogoutButton from './components/LogoutButton';
import SubForum from './components/SubForum';
import ForumSearch from './components/ForumSearch';
import MakeSubForum from './components/MakeSubForum';
import Header from './components/Header';

import { hostURL } from '../httpClient';

const SubForumPage = () => {
    let params = useParams()
    const [forums, setForums] = useState([]);
    useEffect(() => {
        const fetch = async () => {
            try {
                const rep = await httpClient.post(hostURL + 'getforums', {
                    "quantity": 20,
                    "start": 0,
                    "university": params.university
                });
                setForums(rep.data);
            } catch (error) {
            }
        };
        fetch();

    }, []);
    const post_wall = forums.map((el: any) => {
        return (
            // <article key={el.id}>
            //     <Link to={`/forums/${params.university}/${el.title}`}>
            //         <h1>{el.title}</h1>
            //     </Link>
            //     <p>{el.body}</p>
            // </article>
            <div key={el.id}>
                <SubForum forumInfo={el} />
            </div>
        )
    })

    const [title, setTitle] = useState("");

    // const submitPost = async () => {
    //     if (title.length > 0) {
    //         if (validator.isAlphanumeric(title)) {
    //             try {
    //                 const res = await httpClient.post(hostURL + 'makeforum', {
    //                     title,
    //                 });
    //                 //window.location.reload();
    //                 try {
    //                     const rep = await httpClient.post(hostURL + 'getforums', {
    //                         "quantity": 20,
    //                         "start": 0,
    //                         "university": params.university
    //                     });
    //                     setForums(rep.data);
    //                 } catch (error) {
    //                 }
    //                 setTitle("");
    //             } catch (error: any) {
    //                 console.log(error);
    //             }
    //         }
    //         else {
    //             console.log("title must be alphanumeric"); //add error thingy here prob
    //         }
    //     }
    // }

    return (
        <>
        <Header/>
        <div>
            {/* <div>
                <h1>Create SubForum</h1>
                <div>
                    <form>
                        <div>
                            <label>Title</label>
                            <input
                                type='text'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <button type="button" onClick={() => submitPost()}>Submit</button>
                        </div>
                    </form>
                </div>
            </div> */}
            <MakeSubForum func={setForums}/>
        </div>
            <div>{post_wall}</div>
        </>
    )
}

export default SubForumPage