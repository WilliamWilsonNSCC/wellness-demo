import { useMsal } from '@azure/msal-react'
import { msalRequest } from '../authConfig';



export default function Login() { 
    const { instance } = useMsal();
    const handleLogin = () => 
        instance.loginRedirect(msalRequest)
        .catch(console.error)
    
    return ( 
        <div className="login-container">
            <div className="login-card">
               <h1>Login</h1> 
                <p>Please sign in to access your wellness dashboard.</p>

                {/* <form className="login-form">
                    <input type="email" placeholder="Email" required/>
                    <input type="password" placeholder="Password" required/>

                    <button type="submit">Login</button>
                </form> */}
                <button onClick={handleLogin}>
                    Sign in with Microsoft
                </button>
            </div> 
        </div> 
    ); 
}