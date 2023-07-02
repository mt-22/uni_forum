import Logo from '../../media/uPost.svg'
import { useEffect, useState } from 'react'
import httpClient from '../../httpClient'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/header.css'
import { hostURL } from '../../httpClient';

import { Dropdown, Button } from 'react-bootstrap';
import React from 'react'
import ForumSearch from './ForumSearch';

type CustomMenuProps = {
    children?: React.ReactNode;
    className?: string;
  };

const CustomMenu = React.forwardRef(
    ({ children, className}:CustomMenuProps, ref:React.Ref<HTMLDivElement>) => {
  
      return (
        <div
          ref={ref}
          className={className}
        >
          <ul className="list-unstyled">
            {React.Children.toArray(children)}
          </ul>
        </div>
      );
    },
  );

const Header = () => {
    const [user, setUser] = useState(Object)


    useEffect(() => {
        const fetch = async () => {
            try {
                const resp = await httpClient.get(hostURL + '@me')
                setUser(resp.data);
            }
            catch(error:any){console.log(error)}
        }
        fetch()
    }, [])

        const logout = async () => {
            await httpClient.get(hostURL + 'auth/logout');
            window.location.href = '/'
        }

  return (
    <div className='header'>
      {user.authenticated?
        <a href={`/forums/${user.university}/home`}><img className='logo' alt="logo" src={Logo}/></a> : <img className='logo' alt="logo" src={Logo}/>}
        {user.authenticated?
        <>
            <ForumSearch/>
            <Dropdown className="nav-dropdown-wrapper">
                <Dropdown.Toggle className="nav-dropdown-btn">
                    {user.username}
                </Dropdown.Toggle>
                <Dropdown.Menu as={CustomMenu} className="nav-dropdown-list" id="nav-dropdown-list">
                    <Dropdown.Item><div onClick={() => {window.location.href=`/users/${user.username}/forums`}}>Forums</div></Dropdown.Item>
                    <Dropdown.Item><div onClick={logout}>Logout</div></Dropdown.Item>
                    <Dropdown.Item>bar</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            </>
        :<></>}
    </div>
  )
}

export default Header