import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Museum from './pages/Museum';
import Events from './pages/Events';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Feed} />
          <Route path="/post/:id" component={PostDetail} />
          <Route path="/create" component={CreatePost} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/jogos" component={Games} />
          <Route path="/museu" component={Museum} />
          <Route path="/eventos" component={Events} />
          <Route path="/perfil" exact component={Profile} />
          <Route path="/perfil/:username" component={UserProfile} />
          <Route path="/admin" component={Admin} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;