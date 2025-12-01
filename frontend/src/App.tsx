import MyChatbot from './components/MyChatbot'
import Header from './components/Header'
import { useImage } from './contexts/ImageContext'
import './App.css'

function App() {

  const { images } = useImage();
  
  return (
    <>
      <div className='container'>
      <Header />
          <div className='container-pics'>
            {images.length === 0 ? <> <p>No pictures available yet.</p> </> :
             <>
            {images.map((pic: { id: number; url: string; title: string; description: string; }) => (
              <div key={pic.id} className="pic-card">
                <img src={pic.url} alt={pic.title} className="pic-image" />
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
