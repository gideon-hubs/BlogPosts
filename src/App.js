import { Routes, Route} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {format} from 'date-fns';
import api from './api/posts';
import './App.css';
import Header from './componets/Header';
import Nav from './componets/Nav';
import Footer from './componets/Footer';
import Home from './componets/Home';
import NewPost from './componets/NewPost';
import PostPage from './componets/PostPage';
import About from './componets/About';
import Missing from './componets/Missing';
import EditPosts from './componets/EditPosts';


function App() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [editBody, setEditBody] = useState('');
  const history = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('./posts');
        setPosts(response.data);
      } catch (error) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }

    }
    fetchPosts();
  }, []);

  useEffect(()=>{
    const filteredResults = posts.filter(post => 
       ((post.body).toString().toLowerCase()).includes(search.toString().toLowerCase())
     || ((post.title).toString().toLowerCase()).includes(search.toString().toLowerCase()));

    setSearchResults(filteredResults.reverse());
  }, [ posts, search]);

 
  const handleDelete =  async (id) => {
   try {
    await api.delete(`/posts/${id}`);
    const postsList = posts.filter(post => post.id !== id);
    setPosts(postsList);
    history('/');
   } catch (error) {
    console.log(`Error: ${error.message}`);
   }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = posts.length ? posts[posts.length -1].id + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = {id, title: postTitle, datetime, body: postBody};
    try {
      const response = await api.post('./posts', newPost);
      const allPosts = [...posts, response.data];
      setPosts(allPosts);
      setPostTitle('');
      setPostBody('');
      history('/');
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
   
  }

  const handleEdit = async (id) =>{
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = {id, title: editTitle, datetime, body: editBody};
    try {
      const response = await api.put(`/posts/${id}`, updatedPost);
      setPosts(posts.map(post => post.id === id ? {...response.data} : post));
      setEditTitle('');
      setEditBody('');
      history('/');
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }

  return (
  <div className="App">
   
    <Header title="React JS Blog"/>
    <Nav search={search}
      setSearch={setSearch} 
    />
   
      <Routes>
        <Route exact path='/' element={<Home posts={searchResults}/>}/>
        <Route path='/post' element={<NewPost
          postBody={postBody}
          setPostBody={setPostBody}
          postTitle={postTitle}
          setPostTitle={setPostTitle}
          handleSubmit={handleSubmit}
          />}/>
        <Route path='/edit/:id' element={<EditPosts
          posts={posts}
          handleEdit={handleEdit}
          editTitle={editTitle}
          editBody={editBody}
          setEditBody={setEditBody}
          setEditTitle={setEditTitle}
          
          />}/>

        <Route path='/post/:id' element={<PostPage posts={posts} handleDelete={handleDelete}/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='*' element={<Missing/>}/>
      </Routes>

      <Footer/>
      
  </div>
  );
}

export default App;
