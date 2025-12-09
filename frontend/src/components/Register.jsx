import axios from 'axios';

const Register = () => {

    const handleRegister = async(e) => {
        e.preventDefault();
        
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const password2 = e.target.password2.value;
        
        if (username.trim() === null) {
            console.log("Please provide username");
            return;
        }
        
        if (email.trim() === null) {
            console.log("Please provide email");
            return;
        }
        
        if (password !== password2) {
            console.log("Passwords don't match!");
            return;
        }
        
        await axios.post("http://localhost:8000/auth/register", {
            username: username,
            email: email,
            password: password
        },  {
                headers: { "Content-Type": "application/json" },
                withCredentials: false
                }).then(response => {
                        console.log(response);
                }).catch(response => {
                        console.log(response);
                });     
    }
    
    return (
        <>
        <div className="register">
            <h2>Register Page</h2>
        </div>
        
        <div className="login-form">
            <form onSubmit={handleRegister} >
            <div className="form-group">
                <label>Username:</label>
                <br/>
                <input type="text" name="username" id="username" />
                <label>Email:</label>
                <br/>
                <input type="text" name="email" id="email" />
                <br/>
                <label>Password:</label>
                <br/>
                <input type="password" name="password" id="password" />
                <br/>
                <label>Password again:</label>
                <br />
                <input type="password" name="password2" id="password2" />
                <br />
                <button type="submit" className="buttons">Register</button>
            </div>
            </form>
            </div>
        </>
    )
}

export default Register;