import { sign } from 'crypto'
import React, {useEffect, useState} from 'react'
import httpClient from '../httpClient'
import { User } from '../types'
import validator from 'validator'
import Header from './components/Header'
import { Button } from 'react-bootstrap'
import Footer from './components/Footer'
import Logo from '../media/uPost.svg'
import '../styles/login.css'

import { hostURL } from '../httpClient'

const LandingPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [sign_pwd, setSignPwd] = useState('')
    const [cred_toggle, switchCredToggle] = useState(false)
    const [usermail, setUsermail] = useState('')
    const [log_pwd, setLogPwd] = useState('')

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const rep = await httpClient.get('//localhost:5000/@me')
    //             setUser(rep.data)
    //         } catch (error) {
    //             console.log('Not Authenticated')
    //         }
    //     })()
    // })

    const regUser = async () => {
        if (validator.isEmail(email) && validator.isAlphanumeric(username) && username.length < 20) {
            if (email.slice(-4) === '.edu'){
                try {
                    const rep = await httpClient.post(hostURL + 'auth/register', {
                        username,
                        email,
                        sign_pwd
                    })
                    console.log(rep.data)
                    switchCredToggle(false)
                } catch (error: any) {
                    if (error.response.status === '401') {
                        alert('User Already Exists');
                    }
                    console.log(error)
                } 
            }
        }
        else console.log("credential error")
    }
    const logUser = async () => {
        try {
            const rep = await httpClient.post(hostURL + 'auth/login', {
                usermail,
                log_pwd
            })
            const user = rep.data
            window.location.href = `/forums/${user.university}/home`
        } catch (error: any) {
            if (error.response.status === '401') {
                alert('Invalid Credentials');
            }
        } 
    }
    const handleToggle = () => {
        switchCredToggle(!cred_toggle);
        setEmail('');
        setLogPwd('');
        setSignPwd('');
        setUsermail('');
        setUsername('');
    }

  return (
    <div className='page'>
        <Header />
        <div className='body'>
            <div className='front-wrapper'>
                <div className='cred-wrapper'>
                    <div className='input-wrapper'>
                    <img src={Logo} className="upost-logo"/>
                        <div className='form-wrapper'>
                            <form>
                                <div className='input-field centerflex'>
                                    <label>Username/Email</label>
                                    <input 
                                        placeholder='Username/Email'
                                        type="text"
                                        value={usermail}
                                        onChange={(e) => setUsermail(e.target.value)}
                                    />
                                    </div>
                                    <div className='input-field centerflex'>
                                        <label>Password</label>
                                        <input 
                                            placeholder='Password'
                                            type="password"
                                            value={log_pwd}
                                            onChange={(e) => setLogPwd(e.target.value)}
                                        />
                                </div>
                                <Button className="red-btn submit-btn" onClick={logUser}>Submit</Button>
                            </form>
                        </div>
                        <Button className="blue-btn toggle-btn" onClick={(handleToggle)}>No Account? Make One!</Button>
                    </div>
                    <div className={`input-cover ${cred_toggle? "right-cover" : ""}`}>
                        <h1 className='cover-text'>{cred_toggle? "Sign Up" : "Log In"}</h1>
                    </div>
                    <div className='input-wrapper'>
                    <img src={Logo} className="upost-logo"/>
                        <div className='form-wrapper'>
                            <form>
                                <div className='input-field centerflex'>
                                    <label>Username</label>
                                    <input 
                                        placeholder='Username'
                                        type='text'
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className='input-field centerflex'>
                                    <label>Email</label>
                                    <input 
                                        placeholder='Email'
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className='input-field centerflex'>
                                    <label>Password</label>
                                    <input 
                                        placeholder='Password'
                                        type="password"
                                        value={sign_pwd}
                                        onChange={(e) => setSignPwd(e.target.value)}
                                    />
                                </div>
                                <Button className="red-btn submit-btn" onClick={regUser}>Submit</Button>
                            </form>
                        </div>
                        <Button className="blue-btn toggle-btn" onClick={(handleToggle)}>Already Have An Account?</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default LandingPage