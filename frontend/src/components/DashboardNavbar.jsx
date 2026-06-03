import { IoSearchSharp } from "react-icons/io5";

const DashboardNavbar = () => {
  return (
    <>
      <nav class="navbar navbar-expand-lg bg-body-tertiary dashboardNavbar">
        <div class="container-fluid">
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <h3 class="navbar-nav me-auto mb-2 mb-lg-0">
              Welcome Back, Alex <br />
            </h3>
            <form class="d-flex" role="search">
              <input
                class="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button class="btn " type="submit">
                <IoSearchSharp />
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
};
export default DashboardNavbar;
