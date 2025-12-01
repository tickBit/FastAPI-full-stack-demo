import axios from 'axios'
import MyChatbot from './components/MyChatbot'
import Header from './components/Header'
import { useImage } from './contexts/ImageContext'
import './App.css'
import { useEffect } from 'react';


function App() {

  const { images, setImages } = useImage();
  
  useEffect(() => {
    
    axios.get('http://localhost:8000/images/')
      .then(response => {
        console.log('Fetched images:', response.data);
        setImages(response.data);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
      
      return () => {
        // Cleanup if necessary
      }
      
  }, [setImages]);
  
  return (
    <>
      <div className='container'>
      <Header />
          <div className='container-pics'>
            {images.length === 0 ? <> <p>No pictures available yet.</p> </> :
             <>
            {images.map((pic: { id: number; filename: string; title: string; description: string; }) => (
              <div key={pic.id} className="pic-card">
                <img src={`http://localhost:8000/media/images/${pic.filename}`} alt={pic.title} width="500" height="500" className="pic-image" />
                <h3 className="pic-title">{pic.title}</h3>
                <p className="pic-description">{pic.description}</p>
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
