import React, { useEffect } from 'react';
import axios from 'axios'
import MyChatbot from './components/MyChatbot'
import Header from './components/Header'
import { useImage } from './contexts/ImageContext'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import './utils/StarReviews'
import StarReviews from './utils/StarReviews';

  
function App() {

  const { images, setImages } = useImage();
  const { token } = useAuth();
  
  const isAdmin = localStorage.getItem('is_admin');
  
  const [edit, setEdit] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [edited, setEdited] = React.useState(false);
  
  /*
  const handleStars = (e:undefined) => {
    console.log(`Rated image ${e}`);
    
    
    axios.post(`http://localhost:8000/rate/${id}`,
      { stars: stars },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(response => {
      console.log('Rating submitted:', response.data);
      // Optionally, update the images state to reflect the new average rating
    })
    .catch(error => {
      console.error('Error submitting rating:', error);
    });
    
  };
  */
  
  // save edited description to backend
  const handleSaveDescription = (id: number) => {
    
    setEdited(false);
    const desc = document.querySelector("textarea")?.value.trim();

    setDescription(desc || "");
    
    setEdit(false);
    
    if (desc !== description) setEdited(true); else setEdit(false);
        
    if (edited) {
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
    .catch(error => {
      console.error('Error updating description:', error);
    });
  };
  }
  
  // admin's delete image
  const handleDelete = async(id: number) => {
    
    let resp;
    
    try {
      resp = await axios.delete(`http://localhost:8000/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }});
   
      console.log('Image deleted:', resp.data);
      // Update the images state to remove the deleted image
      setImages(images.filter((img: { id: number; filename: string; title: string; description: string; }) => img.id !== id));
  
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  
  
      
  useEffect(() => {
    
    axios.get('http://localhost:8000/images')
      .then(response => {
        console.log('Fetched images:', response.data);
        setImages(response.data);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
      
      
  }, [setImages]);
  
  return (
    <>
      <div className='container'>
      <Header />
          <div className='container-pics'>
            {images.length === 0 ? <> <p>No pictures available yet.</p> </> :
             <>
            {images.map((pic: { id: number; filename: string; title: string; description: string; average_rating: number, total_ratings: number }) => (
              <div key={pic.id}>
                {isAdmin === 'True' ?
                <div className="delete-pic" onClick={() => handleDelete(pic.id)}>Delete</div>
                : <> {null} </>}
                
                <img src={`http://localhost:8000/media/images/${pic.filename}`} alt={pic.title} width="500" height="500" className='pic-image' />
                
                <StarReviews value={pic.average_rating} totalRatings={pic.total_ratings} size={27} />  
                
                {isAdmin === 'True' ? <>
                {!edit ? <>
                  <div className='pic-description' onDoubleClick={() => { setEdit(!edit); setDescription(pic.description);  } }>
                  <p>{pic.description}</p>
                  </div>
                  </> :
                  <>
                  <div className='pic-description' onDoubleClick={() => handleSaveDescription(pic.id) } >
                  <textarea
                    defaultValue={pic.description}
                    rows={4}
                    cols={50}
                  />
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
          </div>
          <MyChatbot />
      </div>
    </>
  )
}

export default App
