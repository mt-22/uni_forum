import { userInfo } from "os"
import { useEffect, useState } from "react"
import { Button } from "react-bootstrap"
import { useParams } from "react-router-dom"
import httpClient, { hostURL } from "../httpClient"
import Header from "./components/Header"

const PendingUsers = () => {
    const params = useParams()
    const [forum, setForum] = useState(Object);
    const [userInfo, setUserInfo] = useState(Object);
    const [isLoading, setLoading] = useState(false);
    const [isPublic, switchPublic] = useState(Boolean)
    const [pendingUsers, setPendingUsers] = useState(Array)

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
        const fetch = async() => {
            try {
                const resp = await httpClient.post(hostURL + 'getforuminfo', {'id': params.subforum})
                setForum(resp.data)
                switchPublic(resp.data.is_public)
                setPendingUsers(resp.data.pending_users)
            }
            catch(error) {console.log(error)}
        }
        fetch();
        get_me();
    }, []);

    const privateSwitch = async() => {
        switchPublic(!isPublic)
        try {
            await httpClient.post(hostURL + 'switchforumpublic', {"id": forum.id})
        }
        catch(error) {console.log(error)}
    }
    
    const approve = async(el:any) => {
        try {
            await httpClient.post(hostURL + 'approvependinguser', {
                "user_id": el.id,
                "forum_id": forum.id
            })
            setPendingUsers(pendingUsers.filter(x => x != el));
        }
        catch(error) {console.log(error)}
    }
    const deny = async(el:any) => {
        try {
            await httpClient.post(hostURL + 'denypendinguser', {
                "user_id": el.id,
                "forum_id": forum.id
            })
            setPendingUsers(pendingUsers.filter(x => x != el));

        }
        catch(error) {console.log(error)}
    }

    const pending_wall = (pendingUsers.length > 0) && pendingUsers.map((el:any) => {
        return (
            <article key={el.id}>
                <p className="pending-user">{el.username}</p>
                <Button onClick={() => approve(el)} className="blue-btn approve-pending-btn">Add</Button>
                <Button onClick={() => deny(el)} className="red-btn approve-pending-btn">Remove</Button>
            </article>
        )
    })

  return (
    <div className='page'>
        <Header />
        <div className='front-wrapper post-page-wrapper forum-page'>
                <div className="back-btn"><a href={`/forums/${params.university}/${params.subforum}`}>Back</a></div>
                {!isLoading? <>
                    <div className="forum-page-info">
                        <div className='forum-name-users'>
                            <h1 className='forum-name'>{params.university}/{forum.title}</h1>
                        </div>
                        {forum.user == userInfo.id && !isLoading && <>
                        <label id='private-label'>Private{!isPublic ?
                        <div id="private-btn-wrapper" onClick={privateSwitch}>
                            <div className="private-btn-front private-btn-right"></div>
                        </div>:
                        <div id="private-btn-wrapper" onClick={privateSwitch}>
                            <div className="private-btn-front priate-btn-left"></div>
                        </div>}</label>
                        </>}
                    </div>
                    <div className="pending-users-wrapper">{pending_wall}</div>
                </>:<></>}
            </div>
        </div>
  )
}

export default PendingUsers