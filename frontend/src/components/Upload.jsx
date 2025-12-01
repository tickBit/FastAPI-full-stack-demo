import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from './Header';
import React from 'react';
import { useImage } from '../contexts/ImageContext';

const Upload = () => {
    
    const { images, setImages } = useImage();
    const { token } = useAuth();
    
    const handleUpload = async(e) => {
        e.preventDefault();
        
        const title = e.target.title.value;
        const fileInput = e.target.file;
        const file = fileInput.files[0];
        
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", file);
        
        let resp;
        
        try {
            resp = await axios.post(`http://localhost:8000/admin/upload`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
                withCredentials: false
            });
        } catch (error) {
            console.error("Upload failed:", error.response ? error.response.data.detail : error.message);
            return;
        }
        console.log("Upload successful:", resp.data);
        
        // add new image to image context
        setImages(prevImages => [...prevImages, resp.data]);
    }
    
    return (
        <>
        <div>
            <Header />
            <h2>Upload Page (admin only)</h2>
            <p>Here admin users can upload new pictures.</p>
        </div>
        
        <div className="upload">
            <form onSubmit={handleUpload}>
                <div className="form-group">
                    <label>Picture Title:</label>
                    <br/>
                    <input type="text" name="title" id="title" />
                    <br/>
                    <label>Picture File:</label>
                    <br/>
                    <input type="file" name="file" id="file" />
                    <br/>
                    <button type="submit" className="buttons">Upload Picture</button>
                </div>
            </form>
        </div>
        </>
 
    )
}

export default Upload;