import React from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ForumPage from './pages/ForumPage'
import SubForumPage from './pages/SubForumPage'
import PostPage from './pages/PostPage'
import UserPage from './pages/UserPage'
import HomePage from './pages/HomePage'
import ForumSearch from './pages/components/ForumSearch'
import SearchPage from './pages/SearchPage'
import Header from './pages/components/Header'
import PendingUsers from './pages/PendingUsers'
import UserForums from './pages/UserForums'


const Router = () => {
  return (
    <>
    {/* <Header/> */}
    <BrowserRouter>
        <Routes>
            <Route path='/test' element={<ForumSearch />}/>
            <Route path='/' element={<LandingPage />}/>
            <Route path='/forums/:university/:subforum' element={<ForumPage />}/>
            <Route path='/forums/:university/' element={<SubForumPage />}/>
            <Route path='/forums/:university/:subforum/:postid' element={<PostPage />}/>
            <Route path='/forums/:university/:subforum/pending' element={<PendingUsers />}/>
            <Route path='/users/:username' element={<UserPage />}/>
            <Route path='/users/:username/forums' element={<UserForums />}/>
            <Route path='/forums/:university/home' element={<HomePage />}/>
            <Route path='/search/forums/:university/:query' element={<SearchPage />}/>
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default Router