import { useEffect, useState } from "react"
import { Dropdown } from "react-bootstrap"
import { useParams } from "react-router-dom"
import httpClient from "../../httpClient"

import { hostURL } from "../../httpClient"

const ForumSearch = () => {
    const [autoResults, setAutoResults] = useState(Array)
    const [searchTerm, setSearch] = useState('')
    const params = useParams();
    const getResults = async (e:string) => {
        let query = e;
        setSearch(query);
        if (query.length == 0) {
            setAutoResults([]);
            return;
        }
        try {
            const resp = await httpClient.post(hostURL + 'forumsearchfill', {
                query,
                "university": params.university
            })
            setAutoResults(resp.data)
        }
        catch (error:any) {console.log(error)}
    }


    const post_wall = autoResults.map((el: any) => {
        return (
                // <a href={`/forums/umass/${el.id}`} 
                // className="dropdown-item" role="button"> 
                //     {el.title}
                // </a>
                <Dropdown.Item key={el.id} href={`/forums/umass/${el.id}`} className="search-item">
                    <p className="search-item-forum">{params.university}/{el.title}</p><p className="search-item-user">{el.username}</p></Dropdown.Item>
        )
    })

    const search = () => {
        if (searchTerm.length > 0 && autoResults.length > 0){
            window.location.href = `/search/forums/${params.university}/${searchTerm}`
        }
    }

    const [navFocus, setNavFocus] = useState(false);
    const [resFocus, setResFocus] = useState(false);

    //removes dropdown when clicking link-- didn't work
    //focus for results/bar with small timeout onblur fix
    const unFocus = () => {
        setTimeout(() => {
            setNavFocus(false)
            console.log("foo")
        }, 10000000)
    }


  return (
    <div className="search-wrapper" onBlur={unFocus} onFocus={() => setNavFocus(true)}>
        <div className="search-input-wrapper">
            <input 
            placeholder="Search Forums"
            className="search-input"
            type="text" 
            onChange={(e) => getResults(e.target.value)}
            />
            <button onClick={search} className="search-btn">Search</button>
        </div>
        {(!navFocus && !resFocus)?<></>:
        <>{autoResults.length > 0?
        <div onFocus={() => setResFocus(true)}
        onBlur={() => setResFocus(false)}className="search-results nav-dropdown-list">
            <ul className="results-wrapper">
            {post_wall}
            </ul >
        </div> : <> 
        {(searchTerm.length > 0)?
        <div className="search-results nav-dropdown-list"><p id="search-no-res">No results.</p></div> : 
         <></>}
         </>
        }</>}
    </div>
  )
}

export default ForumSearch