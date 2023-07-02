import React, { useEffect, useState } from 'react'
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
    <div key={forum.id}>
        <a href={`/users/${forum.user}`}><p>{forum.user}</p></a>
        <Link to={`/forums/${params.university}/${forum.id}`}>
            <h1>{forum.title}</h1>
        </Link>
        <p>{followCount} Users</p>
        <button onClick={() => follow()}>Join</button>
    </div>
  )
}

export default SubForum