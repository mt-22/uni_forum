import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css'
import Header from './pages/components/Header';
import Footer from './pages/components/Footer';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <Header/> */}
    <Router />
    <Footer/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
