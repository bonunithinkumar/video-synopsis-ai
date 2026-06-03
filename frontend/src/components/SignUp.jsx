import "../styles/auth.css";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoMdHome } from "react-icons/io";

const SignUp = () => {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const data = {
      UserName: e.target.userName.value,
      email: e.target.email.value,
      password: e.target.password.value,
      role: e.target.role.value,
    };

    try {
      await axios.post("http://localhost:3000/api/auth/register", data);
      navigate("/dashboard");
    } catch (err) {
      if (err?.response && err.response.status === 409) {
        setErrorMessage(err.response.data.message);
      }
      console.log("Failed to post", err?.message || err);
    }
  };

  return (
    <>
      <div className="card auth-card" style={{ width: "30rem" }}>
        <h1>Sign Up</h1>
        {errorMessage && <h4>email exists please login</h4>}
        <form className="auth-from" onSubmit={handleSignup}>
          <div className="mb-3">
            <label htmlhtmlFor="userName" className="form-label">
              <IoPersonOutline className="form-icon" /> User Name
            </label>

            <input
              type="string"
              className="form-control"
              id="userName"
              name="userName"
              aria-describedby="emailHelp"
              placeholder="Enter UserName"
            />
          </div>
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
              placeholder="Enter a Vaild email"
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
          <select
            className="form-select form-select-sm"
            aria-label="Small select example"
            defaultValue=""
            name="role"
          >
            <option value="" disabled>
              Select Your Role
            </option>
            <option value="user">User</option>
            <option value="admin">admin</option>
          </select>
          <button type="submit" className="btn btn-submit btn-primary">
            SignUp
          </button>
        </form>
        <p>
          Already you have an Account ? <a href="/login">Login</a>{" "}
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

export default SignUp;
