import React, { useEffect, useState } from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import httpClient, { hostURL } from '../httpClient'
import Header from './components/Header'
import Select, { StylesConfig } from 'react-select'
import '../styles/userforums.css'

const colourStyles = {
    menu: (styles:any) => ({
        ...styles,
        marginTop: 0,
    }),
    menuList: (styles:any) => ({
        ...styles,
        paddingTop: 0,
    }),
    control: (styles:any) => ({
        ...styles, 
        backgroundColor: 'white' ,
        border: "1px solid var(--jet)",
        outline: 'none',
        boxShadow: 'none',
        borderRadius: '5px 5px 0 0',
        borderBottom: 'none',
        '&:hover': {
            cursor: 'pointer'
        },
        '&:focus-visible': {
            outline: 'none'
        }
        }),
    option: (styles:any, { data, isDisabled, isFocused, isSelected }:any) => {
      return {
        ...styles,
        backgroundColor: isSelected? "var(--red)" : "white", 
        color: isSelected? 'white' : "var(--jet)",
        margin: 0,
        '&:hover': {
            backgroundColor: 'var(--darkred)',
            color: "white",
            cursor: "pointer"
        },
        '&:active': {
            backgroundColor: 'var(--red)'
        }
      };
    },
  };

const UserForums = () => {
    const [isLoading, setLoading] = useState(Boolean)
    const [forums, setForums] = useState(Array)
    const [ownedForums, setOwnedForums] = useState(false)

    useEffect(() => {
        const fetch = async() => {
            try {
                setLoading(true)
                if (ownedForums) {
                    const resp = await httpClient.post(hostURL + 'getownedforums', {
                        "quantity": 0,
                        "start": 0
                    })
                    setForums(resp.data)
                } else {
                    const resp = await httpClient.post(hostURL + 'getfollowedforums', {
                        "quantity": 0,
                        "start": 0
                    })
                    setForums(resp.data)
                }
                setLoading(false)
            }
            catch(error) {console.log(error)}
        }
        fetch()
    }, [ownedForums])

    const forum_wall = (forums.length > 0) && forums.map((el:any) => {
        return (
            <div className="subforum-item" key={el.id}>
                <a href={`/forums/${el.university}/${el.id}`}>{`${el.university}/${el.title}`}</a>
            </div>
        )
    })

    const selectOptions = [
        {value: false, label: "Followed"},
        {value: true, label: "Owned"},
    ];

  return (
    <div className='page'>
    <Header />
    <div className='front-wrapper post-page-wrapper forum-page'>
        <h1 className="forum-type-wrapper">{ownedForums? "Owned" : "Followed"}</h1>
        <div className='forum-results-wrapper'>
        <Select options={selectOptions} defaultValue={selectOptions.filter(option => option.label === "Followed")}
         onChange={(e) => { e && setOwnedForums(e.value);
         console.log(e?.value)
         }} isSearchable={false}
        //  classNamePrefix="forum-select-item"
        styles={colourStyles}
         className="forum-select-wrapper"/>
        {!isLoading && 
        <>
            <div className='subforum-wall'>{forum_wall}</div>
        </>}</div>
        </div>
    </div>
  )
}

export default UserForums