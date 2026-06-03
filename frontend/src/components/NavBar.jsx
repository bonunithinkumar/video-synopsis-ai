import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const NavBar = () => {
    const navigate = useNavigate('');
    const handleLogin = () => {
        navigate('/login');
    }
    const handleSignUp = () => {
        navigate('/signUp')
    }
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary navbar-styles">
        <div className="container-fluid ">
          <a className="navbar-brand navbar-icon" href="#">
            Video Synopsis AI
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-item-color" aria-current="page" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-item-color" aria-current="page" href="#pricing">
                  Pricing
                </a>
              </li>
            </ul>
            <button className="button-signup" type="submit" onClick={handleLogin}>
              Login
            </button>
            <button className="button-signup" type="submit" onClick={handleSignUp}>
              SignUp
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
