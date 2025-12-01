import axios from 'axios'
import MyChatbot from './components/MyChatbot'
import Header from './components/Header'
import { useImage } from './contexts/ImageContext'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import React, { useEffect } from 'react';

  
function App() {

  const { images, setImages } = useImage();
  const { token } = useAuth();
  
  const isAdmin = localStorage.getItem('is_admin');
  
  const [edit, setEdit] = React.useState(false);
  
  // save edited description to backend
  const handleSaveDescription = (id: number) => {
    const textarea = document.querySelector('.pic-description textarea') as HTMLTextAreaElement;
    const newDescription = textarea.value;

    setEdit(false);
        
    axios.put(`http://localhost:8000/update/${id}`,
      { description: newDescription },
      { headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        } }
    )
    .then(response => {
      console.log('Description updated:', response.data);
      // Update the images state with the new description
      setImages(images.map((img: { id: number; filename: string; title: string; description: string; }) => 
        img.id === id ? { ...img, description: newDescription } : img
      ));
    })
    .catch(error => {
      console.error('Error updating description:', error);
    });
  };
          
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
            {images.map((pic: { id: number; filename: string; title: string; description: string; }) => (
              <div key={pic.id}>
                {isAdmin === 'True' ?
                <div className="delete-pic" onClick={() => handleDelete(pic.id)}>Delete</div>
                : <> {null} </>}
                
                <img src={`http://localhost:8000/media/images/${pic.filename}`} alt={pic.title} width="500" height="500" className="pic-image" />
                {!edit ? <>
                  <div className='pic-description' onDoubleClick={() => setEdit(!edit)}>
                  <p>{pic.description}</p>
                  </div>
                  </> :
                  <>
                  <div className='pic-description' onDoubleClick={() => handleSaveDescription(pic.id)}>
                  <textarea
                    defaultValue={pic.description}
                    rows={4}
                    cols={50}
                  />
                  </div>
                  </>
                }
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
