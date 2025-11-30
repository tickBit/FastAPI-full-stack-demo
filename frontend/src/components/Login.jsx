import axios from "axios";
import Header from "./Header";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {

    const { login } = useAuth();    
    
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
                withCredentials: false,
                timeout: 10000,
            });
        
            const data = resp.data;
            if (data && data.access_token) {
                login(username, data.access_token);
            } else {
                alert("Login failed");
            }
            
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login. Please try again.");
        }
    }
    
    return (
        <>
        <Header />
        <div className="login">
            <h2>Login Page</h2>
            
            <div>
            <form onSubmit={handleLogin}>
                <label>Username:</label>
                <input type="text" name="username" id="username" />
                
                <label>Password:</label>
                <input type="password" name="password" id="password" />
                
                <button type="submit">Login</button>
            </form>
            </div>
        </div>
        </>
    )
}

export default Login;