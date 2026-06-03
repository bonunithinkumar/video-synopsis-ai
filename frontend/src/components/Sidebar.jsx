import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/sidebar.css'
import { MdOutlineDashboard } from "react-icons/md";
import { MdHistory } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";

const Sidebar = () => {
  // 1. Create a state variable to track if the dropdown is open
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 2. Toggle the dropdown state
  const toggleDropdown = (e) => {
    e.preventDefault(); // Prevent page jump from the "#" href
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:3000/api/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err?.message || err);
      // Still redirect to login even if logout fails
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark sidebar"
        style={{ width: "280px", height: "100vh" }}
      >
        {/* Brand/Logo */}
        <a
          href="/"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        >
          <svg className="bi pe-none me-2" width="40" height="32">
            <use xlinkHref="#bootstrap" />
          </svg>
          <span className="fs-4 navbar-icon">Video <br /> Synopsis <br />AI</span>
        </a>
        <hr />

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto">
          <li>
            <a href="#" className="nav-link text-white">
              <svg className="bi pe-none me-2" width="16" height="16">
                <MdOutlineDashboard />
              </svg>
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="nav-link text-white">
              <svg className="bi pe-none me-2" width="16" height="16">
                <HiOutlineSparkles />
              </svg>
              Generate
            </a>
          </li>
           <li>
            <a href="#" className="nav-link text-white">
              <svg className="bi pe-none me-2" width="16" height="16">
                <MdHistory />
              </svg>
              History
            </a>
          </li>
           <li>
            <a href="#" className="nav-link text-white">
              <svg className="bi pe-none me-2" width="16" height="16">
                <MdOutlineSettings />
              </svg>
              Setting
            </a>
          </li>
        </ul>
        <hr />

        {/* User Profile Dropdown */}
        <div className="dropdown">
          {/* 3. Added onClick handler and dynamic aria-expanded value */}
          <a
            href="#"
            className={`d-flex align-items-center text-white text-decoration-none dropdown-toggle ${isDropdownOpen ? "show" : ""}`}
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
          >
            <img
              src="https://github.com/mdo.png"
              alt="User Profile"
              width="32"
              height="32"
              className="rounded-circle me-2"
            />
            <strong>mdo</strong>
          </a>

          {/* 4. Conditionally add the "show" class and popover positioning styles */}
          <ul
            className={`dropdown-menu dropdown-menu-dark text-small shadow ${isDropdownOpen ? "show" : ""}`}
            style={{
              position: "absolute",
              inset: "auto auto 100% 0px",
              margin: "0px",
              transform: isDropdownOpen
                ? "translate3d(0px, -10px, 0px)"
                : "none",
              display: isDropdownOpen ? "block" : "none",
            }}
          >
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a onClick={handleLogout} className="dropdown-item" href="#">
                Sign out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
