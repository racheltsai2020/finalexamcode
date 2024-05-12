import './App.css';
import Home from './pages/home';
import Result from './pages/result';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

import config from './amplifyconfiguration.json';
Amplify.configure(config);

const App = ({signOut, user}) => {

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home signOut={signOut} user={user}/>} />
        <Route path="/result" element={<Result signOut={signOut} user={user} />} />
      </Routes>
    </Router>
  );
}

export default withAuthenticator(App);
