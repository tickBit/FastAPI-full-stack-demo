import axios from "axios";
import { Link } from "react-router";
import Header from "./Header";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect } from "react";

const Login = () => {

    const { username, login } = useAuth();    
    
    const [status, setStatus] = React.useState("Waiting");
    const [backgroundColor, setBackgroundColor] = React.useState("lightgrey");

    useEffect(() => {
        if (username === "") {
            setStatus("Logged out.");
            setBackgroundColor("lightgrey");
        }
    }, [username]);
       
    const handleLogin = async (e) => {
        e.preventDefault();

        // read values from form inputs
        const username = e.target.username.value;
        const password = e.target.password.value;
    
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        
        let resp;
        
        try {
            
            resp = await axios.post("http://localhost:8000/auth/login", params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                withCredentials: false
            });
        
            const data = resp.data;
            if (data && data.access_token) {
                localStorage.setItem("is_admin", data.is_admin);
                login(username, data.access_token, data.is_admin);
                
                setStatus("Login successful.");
                setBackgroundColor("lightgreen");
                
                console.log(data);
                /* The following is for the userinterface to show/hide features.
                   There is still check in the backend to prevent unauthorized access. */
    
            } else {
                setStatus("Login failed. Check credentials.");
                setBackgroundColor("red");
            }
            
        } catch (error) {
            setStatus(error.response ? error.response.data.detail : "Error.");
            setBackgroundColor("red");
        }
    }
    
    return (
        <>
        <Header />
        <div className="login">
            <h2>Login Page</h2>
            
            <div className="login-status" style={{ backgroundColor: backgroundColor }}>
                <div className="column">
                    <p>Status: </p>
                </div>
                <div className="column">
                    <p>{status}</p>
                </div>
            </div>
            
            <div className="login-form">
            <form onSubmit={handleLogin}>
            <div className="form-group">
                <label>Username:</label>
                <br/>
                <input type="text" name="username" id="username" />
                <br/>
                <label>Password:</label>
                <br/>
                <input type="password" name="password" id="password" />
                <br/>
                <button type="submit" className="buttons">Login</button>
            </div>
            </form>
            {username !== "" && <Link to="/">Browse pictures</Link>}
            </div>
        </div>
        </>
    )
}

export default Login;