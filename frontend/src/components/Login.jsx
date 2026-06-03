import { useState } from "react";
import "../styles/auth.css";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdHome } from "react-icons/io";

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    console.log("login");
    e.preventDefault();
    setErrorMessage("");

    const data = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      await axios.post("http://localhost:3000/api/auth/login", data);
      navigate("/dashboard");
    } catch (err) {
      if (err?.response && err.response.status === 401) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(
          err?.response?.data?.message || err?.message || "Login failed",
        );
      }
      console.log("Failed to post", err?.message || err);
    }
  };

  return (
    <>
      <div className="card auth-card" style={{ width: "30rem" }}>
        <h1>Login</h1>
        {errorMessage && (
          <div
            className="alert alert-danger"
            role="alert"
            style={{
              fontSize: "0.9rem",
              padding: "8px 12px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}
        <form className="auth-from" onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlhtmlFor="email" className="form-label">
              <MdOutlineEmail className="form-icon" />
              Email address
            </label>

            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              aria-describedby="emailHelp"
              placeholder="Enter a Valid email"
            />
          </div>

          <div className="mb-3">
            <label htmlhtmlFor="exampleInputPassword1" className="form-label">
              <RiLockPasswordLine className="form-icon" />
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
              name="password"
              placeholder="Enter Password"
            />
          </div>
          <button type="submit" className="btn btn-submit btn-primary">
            Login
          </button>
        </form>
        <p>
          don't you have an Account ? <a href="/signup">SignUp</a>{" "}
        </p>
        <p>
          <a className="Home-href" href="/">
            <IoMdHome className="Home-href-icon" /> Home
          </a>
        </p>
      </div>
    </>
  );
};

export default Login;
