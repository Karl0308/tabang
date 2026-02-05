import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import your CSS file
import Loading from './components/Loading';
import { APIURLS } from "./APIURLS";

function Login() {
    const [username, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        axios.post(APIURLS.user.login(), {
                    username,
                    password,
                })
        .then(res => {
            setIsLoading(false);
            localStorage.setItem('token', res.token);
            // isSubmitted(true);
        }).catch(function (error) {
            setError(error.response.data);
            setIsLoading(false);
        });
        // try {
        //     const response = await axios.post('your-api-url/login', {
        //         user,
        //         password,
        //     });
        //     await new Promise((resolve) => setTimeout(resolve, 1500));

        //     setIsLoading(false);

        //     // Store the token (response.data.token) in local storage or state
        // } catch (error) {
        //     console.error('Login error:', error);
        // }
    };

    return (

        <>
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* <h1>TABANG</h1> */}
                    <h2>Login</h2>
                    <div className="input-group">
                        <label>User</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUser(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="remember-me-group">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            id="rememberMeCheckbox"
                        />
                        <label htmlFor="rememberMeCheckbox">Remember Me</label>
                    </div>
                    <button type="submit">Login</button>
                </form>
                { isLoading ? <Loading /> : ""}
            </div>
        </>
    );
}

export default Login;