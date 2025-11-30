import { Link } from "react-router";
import '../index.css';

const Header = () => {
    
    return (
        <div className="header">
            <div className="navigation">
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
            <h1>Picture show app</h1>
        </div>
        
    )
}

export default Header;