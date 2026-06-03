import { IoIosFlash } from "react-icons/io";

const Hero = () => {
  return (
    <>
      <div className="px-4 pt-5 my-5 text-center ">
        {" "}
        <h1 className="display-4 fw-bold text-body-emphasis">
          <p className="hero-outer">
            Summarize hours of
            <br />
            <p className="hero-inner">video in seconds</p>
          </p>
        </h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4 hero-paragraph">
            Video Synopsis Ai synthesizes complex YouTube content into
            actionable insights. Stop watching, start knowing.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5 input-bar-overall">
            <input
              type="text"
              placeholder="Paste Your URL here"
              className="input-generate"
            />
            <button
              type="button"
              className="button-generate"
              style={{ fontSize: "20px" }}
            >
              Generate <IoIosFlash style={{ fontSize: "25px" }} />
            </button>
          </div>
        </div>
      </div>
      <div className="history-demo">
        <img
          src="/maxresdefault.jpg"
          alt="React js"
          className="history-demo-image"
        />
        <div className="history-demo-content">
          <h4>React JS Course</h4>
          <p>Channel : Simple Dev</p>
          <p className="text-color-design">Executive Summary</p>
          <p>
            The video outlines 3 pivotal shifts in React: Server Components, the
            upcoming Compiler (React Forget), and simplified state patterns via
            Signals. Developers should focus on data-fetching architecture over
            client-side complexity.
          </p>
          <div className="history-demo-content-boxes">
            <h6 className="text-color-design" style={{ "margin-left": "70px" }}>
              KEY TAKEAWAYS
            </h6>
            <p> RSC drastically reduces bundle size</p>
            <p> React Forget automates memoization</p>
            <p> Use useFormStatus for better UX</p>
          </div>
          <div className="history-demo-content-boxes" >
            <h6 className="text-color-design" style={{ "margin-left": "70px" }}>TIMESTAMP GEMS</h6>
            <p> 04:12 - Hydration deep dive</p>
            <p> 08:45 - The 'Memo' killer pattern</p>
            <p>12:30 - Future roadmap</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
