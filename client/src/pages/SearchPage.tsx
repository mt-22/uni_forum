import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import httpClient from "../httpClient"
import ForumSearch from "./components/ForumSearch"
import Header from "./components/Header"
import SubForum from "./components/SubForum"


import { hostURL } from "../httpClient"

const SearchPage = () => {
    const [results, setResults] = useState(Array)
    const [followCount, setFollows] = useState(Array)
    const [isFollowed, swapFollowed] = useState(Boolean)
    const params = useParams();

    useEffect(() => {
        const fetch = async() => {
            try {
                const resp = await httpClient.post(hostURL + 'forumresults', {
                    "query": params.query,
                    "university": params.university
                })
                setResults(resp.data)
                setFollows(resp.data.users.length)
                swapFollowed(resp.data.followed)
            }
            catch (error:any) {
                console.log(error)
            }
        }
        fetch()
    }, [])

    const post_wall = results.map((el: any) => {
        return (
            <div key={el.id}>
                <SubForum forumInfo={el}/>
            </div>
        )
    })

  return (
    <>
        <Header/>
        <div>{[post_wall]}</div>
    </>
  )
}

export default SearchPage