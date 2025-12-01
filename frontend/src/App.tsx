import axios from 'axios'
import MyChatbot from './components/MyChatbot'
import Header from './components/Header'
import { useImage } from './contexts/ImageContext'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import { useEffect } from 'react';

  
function App() {

  const { images, setImages } = useImage();
  const { token } = useAuth();
  
  const isAdmin = localStorage.getItem('is_admin');
 
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
                <div className='pic-description'>
                <p>{pic.description}</p>
                </div>
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
