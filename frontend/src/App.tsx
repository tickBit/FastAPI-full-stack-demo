import React, { useEffect } from 'react';
import axios from 'axios'
import MyChatbot from './components/MyChatbot'
import Header from './components/Header'
import { useImage } from './contexts/ImageContext'
import { useAuth } from './contexts/AuthContext'
import './utils/StarReviews'
import StarReviews from './utils/StarReviews';
import './App.css'
import { Link } from 'react-router';

function App() {

  const { images, setImages } = useImage();
  const { token, is_admin, logout } = useAuth();
  
  const [edit, setEdit] = React.useState(-1);
  const [description, setDescription] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [count, setCount] = React.useState(0);
  const [error, setError] = React.useState("");
  
  // save edited description to backend
  const handleSaveDescription = (id: number) => {
    
    const desc = document.querySelector("textarea")?.value.trim();
        
    if (desc?.toString() !== description.toString()) {
        
      axios.put(`http://localhost:8000/update/${id}`,
      { description: desc },
      { headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        } }
    )
    .then(response => {
      console.log('Description updated:', response.data);
      // Update the images state with the new description
      setImages(images.map((img: { id: number; filename: string; desc: string; }) => 
        img.id === id ? { ...img, description: desc } : img
      ));
    })
    .catch(err => {
      setError(err.response.data.detail);
    });
  };
    setEdit(-1);
  }
  
  // admin's delete image
  const handleDelete = async(id: number) => {

    await axios.delete(`http://localhost:8000/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }})
    .then(resp => {
      console.log('Image deleted:', resp.data);
      // Update the images state to remove the deleted image
      setImages(images.filter((img: { id: number; filename: string; title: string; description: string; }) => img.id !== id));

    }).catch(err => {
      console.log(err)
      setError(err.response.data.detail);
      console.log(err);
    })
  };
      
  useEffect(() => {
    console.log(error)
    if (error === "Token expired") logout();
    
    const fetchImages = async() => {
      
      if (token !== null) {
        await axios.get(`http://localhost:8000/validate`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(resp => {
          console.log(resp);
        })
        .catch(err => {
            if (err.response.data.detail) setError(err.response.data.detail);
        });
      }
      
      await axios.get(`http://localhost:8000/images?page=${page}`)
      .then(response => {
        setImages(response.data[0]);
        console.log(response.data[0]);
        setCount(response.data[1].count);
      })
      .catch(err => {
        try {
          setError(err.response.data.detail);
        } catch (err) {
          console.log(err);
        }
        
        console.error('Error fetching images:', err);
      });
    }

    fetchImages();
    
  }, [error, token, page, setImages, logout]);
  
  return (
    <>
      <div className='container'>
      <Header />
          <div className='container-pics'>
            {images.length === 0 ? <> <p>No pictures available yet.</p> </> :
             <>
            {images.map((pic: { id: number; filename: string; title: string; description: string; average_rating: number, total_ratings: number }) => (
              <div key={"a"+pic.id}>
                {is_admin === 'True' ?
                <div className="delete-pic" onClick={() => handleDelete(pic.id)}>Delete</div>
                : <> {null} </>}
                
                <img src={`http://localhost:8000/media/images/${pic.filename}`} alt={pic.title} width="500" height="500" className='pic-image' />

                <StarReviews value={pic.average_rating} totalRatings={pic.total_ratings} size={27} picId={pic.id} />
                
                {is_admin === 'True' ? <>
                {edit === pic.id ? 
                 <>
                  <div className='pic-description' onDoubleClick={() => handleSaveDescription(pic.id) } >
                  <textarea
                    defaultValue={description}
                    rows={4}
                    cols={50}
                  />
                  </div>
                  </>
                 :
                 <>
                  <div className='pic-description' onDoubleClick={() => { setEdit(pic.id); setDescription(pic.description.trim());  } }>
                  <p>{pic.description}</p>
                  </div>
                  </>
                }
              </>
              : <>
                <div className='pic-description'>
                  <p>{pic.description}</p>
                </div>
              </>}
              
              </div>
            ))}
            </>
            }
            
            { (page > 1 && page * 2 < count) &&
             (
              <>
              <Link onClick={() => setPage(page + 1)} to="">Next</Link> <Link onClick={() => setPage(page - 1)} to="">Prev</Link>
              </>
              )
            }
            {
             (page === 1 && count > 2) && ( <Link onClick={() => setPage(page + 1)} to="">Next</Link> )
            }
            {
             (2 * page - count > 0) && ( <Link onClick={() => setPage(page - 1)} to="">Prev</Link> )
            }
          </div>
          <MyChatbot />
      </div>
    </>
  )
}

export default App
