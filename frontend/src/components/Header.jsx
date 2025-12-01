import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import '../index.css';



const Header = () => {

    const { isLoggedIn, logout } = useAuth();
        
    return (
        <div className="header">
            <div className="container-nav">
                <div className="navigation">
                    <Link to="/">Home</Link>
                    {isLoggedIn === false ? <>
                     <Link to="/login">Login</Link>
                     </>
                     :
                     <>
                     <Link onClick={() => logout()}>Logout</Link>
                    </>
                    }
                    <Link to="/register">Register</Link>
                </div>
                <div className="navigation-admin">
                    <Link to="/upload">Upload (admin)</Link>
                </div>
            </div>
            <h1>Picture show app</h1>
        </div>
        
    )
}

export default Header;