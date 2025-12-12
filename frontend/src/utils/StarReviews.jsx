import { useState, useEffect } from "react";
import React from "react";
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const StarReviews = (props) => {

    const { token, isLoggedIn } = useAuth();
        
    const [fullStars, setFullStars] = React.useState(0);
    const [halfStars, setHalfStars] = React.useState(0);
    const [emptyStars, setEmptyStars] = React.useState(0);
    const [givenStars, setGivenStars] = React.useState(0.0);
    const [newAvg, setNewAvg] = React.useState(0);
    const [isReviewed, setIsReviewed] = React.useState(false);
    
    function computeStars(value) {
        const full = Math.floor(value);
        const half = value % 1 >= 0.25 && value % 1 <= 0.75 ? 1 : 0;
        const empty = 5 - full - half;
        return { full, half, empty };
    }
    
    const handleStars = async(picId) => {        
      
      if (isReviewed) {
              
        await axios.post(
        `http://localhost:8000/images/rate/${picId}`,
        { stars: givenStars },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
            }
        }
        )
        .then(response => {
          console.log('Rating submitted:', response.data);

            const updated = axios.get(`http://localhost:8000/images/${picId}`).then(resp => {
                setNewAvg(resp.data.average_rating);
                
            }).catch(err => { 
                console.log(err);
            });
        })
        .catch(error => {
          console.error('Error submitting rating:', error);
        });
        
      };
      
      setIsReviewed(false);
      
    }
    
    const handleClick = (e) => {
        
        if (isLoggedIn === false) return;
        
        setIsReviewed(true);
        
        if (fullStars == e) {
            setFullStars(0);
            setHalfStars(0);
            setEmptyStars(5);
            setGivenStars(0);

            return;
        }
        
        setFullStars(parseInt(e));
        setHalfStars(0);
        setEmptyStars(5 - parseInt(e));
        
        setGivenStars(e);
    }
    
    useEffect(() => {
        
        const rating = newAvg === 0 ? props.value : newAvg;
        const { full, half, empty } = computeStars(rating);

        setFullStars(full);
        setHalfStars(half);
        setEmptyStars(empty);
        
    }, [props.value, newAvg]);
    
    return (
        <div value={props.value}>
            {Array.from({ length: fullStars }, (_, i) =>
                <svg key={i} onClick={() => handleClick(i + 1)}
                    xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} fill="currentColor" className="bi bi-star-fill" style={{ color: "gold" }} viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
            )}
            
            {Array.from({ length: halfStars }, (_, i) => 
                <svg key={i} onClick={() => handleClick(fullStars + 0.5)}
                    xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} fill="currentColor" className="bi bi-star-half" style={{ color: "gold" }} viewBox="0 0 16 16">
                    <path d="M5.354 5.119 7.538.792A.516.516 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.537.537 0 0 1 16 6.32a.548.548 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.52.52 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.58.58 0 0 1 .085-.302.513.513 0 0 1 .37-.245l4.898-.696zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.565.565 0 0 1 .162-.505l2.907-2.77-4.052-.576a.525.525 0 0 1-.393-.288L8.001 2.223 8 2.226v9.8z" />
                </svg>
            )}
            
            {Array.from({ length: emptyStars }, (_, i) => 
                <svg key={i} onClick={() => handleClick(i + fullStars + halfStars + 1)}
                    xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} fill="currentColor" className="bi bi-star" style={{ color: "gold" }} viewBox="0 0 16 16">
                    <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                </svg>
            )}
            
            {isLoggedIn ?
                <img src="svgs/disk-svgrepo-com.svg" width={props.size} height={props.size} className="disk" onClick={ () => handleStars(props.picId) } />
                : null }
        </div>
    );
}

export default StarReviews;