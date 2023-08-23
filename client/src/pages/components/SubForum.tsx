import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom'
import httpClient from '../../httpClient';

const hostURL = "//localhost:5000/"

const SubForum = ({
    forumInfo}:any

) => {
    const params = useParams();
    const [forum, setForum] = useState(Object)
    const [followCount, setFollows] = useState(Number);
    const [isFollowed, swapFollowed] = useState(Boolean);

    useEffect(() => {
        const fetch = async () => {
            try {
                const rep = await httpClient.post(hostURL + 'getforuminfo', {
                    "id": forumInfo.id
                });
                setForum(rep.data)
                setFollows(rep.data.users.length)
                swapFollowed(rep.data.followed)
            } catch (error) {
                console.log(error);
            }
        };
        fetch();
    }, []);

    const follow = async () => {
        try {
                await httpClient.post(hostURL + 'followforum', {"id":forumInfo.id});
                if (!isFollowed) {setFollows(followCount+1)} else {setFollows(followCount-1)};
                swapFollowed(!isFollowed);
        }
        catch (error) {console.log(error)}
    }

  return (
    <div key={forum.id} className="search-forum-wrapper">
        <Link to={`/forums/${params.university}/${forum.id}`} className='search-forum-link'>
            <h1>{`${params.university}/${forum.title}`}</h1>
        </Link>
        <p className='search-forum-usercount'>{followCount} Users</p>
        <Button className="red-btn" onClick={() => follow()}>Join</Button>
    </div>
  )
}

export default SubForum