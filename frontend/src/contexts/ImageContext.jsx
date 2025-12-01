import { createContext, useContext, useState, useEffect } from 'react';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <ImageContext.Provider value={{ images, setImages, loading, setLoading, error, setError }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImage = () => useContext(ImageContext);