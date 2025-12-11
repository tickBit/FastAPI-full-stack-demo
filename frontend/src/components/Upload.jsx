import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from './Header';
import React from 'react';
import { useImage } from '../contexts/ImageContext';
import Dialog from './Dialog';

const Upload = () => {
    
    const { images, setImages } = useImage();
    const { token, isLoggedIn, is_admin } = useAuth();
    const [title, setTitle] = React.useState("");
    const [showDialog, setShowDialog] = React.useState(false);
    
    const onOk = () => {
        setShowDialog(false);
        return true;
    }
    
    const handleUpload = async(e) => {
        e.preventDefault();
        
        const desc = e.target.desc.value;
        const fileInput = e.target.file;
        const file = fileInput.files[0];
        
        const formData = new FormData();
        formData.append("description", desc);
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
        setTitle("Success!");
        setShowDialog(true);
        
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
        {showDialog === true ? <Dialog title={title} onConfirm={onOk} ok="Ok" color="lightgreen" /> : null}

        {isLoggedIn === true  && is_admin === "True" ? <>
        <div className="upload">
            <form onSubmit={handleUpload}>
                <div className="form-group">
                    <label>Picture description:</label>
                    <br/>
                    <textarea cols="60" rows="3" name="desc" id="desc" />
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
        : null }
        </>
 
    )
}

export default Upload;