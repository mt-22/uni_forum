import React from 'react'
import httpClient from '../../httpClient'

import { hostURL } from '../../httpClient'

const LogoutButton = () => {

    const logout = async () => {
        await httpClient.get(hostURL + 'auth/logout');
        window.location.href = '/'
    }

  return (
    <>
        <button onClick={() => logout()}>Logout</button>
    </>
  )
}

export default LogoutButton