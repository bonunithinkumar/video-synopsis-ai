import "../styles/sections.css";
import { MdContentPaste } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";
import { FaRegFileLines } from "react-icons/fa6";
import { IoMdHome } from "react-icons/io";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const Sections = () => {
  return (
    <>
      <section id="features" className="even">
        <h1 className="title-section1">
          Intelligence, Simplified
          <h6 style={{ color: "grey" }}>
            Three steps to reclaiming your time.
          </h6>
        </h1>

        <div className="content-boxes-section1">
          <div className="section1-content-boxes ">
            <MdContentPaste className="section1-content-boxes-title-icons" />
            <h4 className="section1-content-boxes-title">Paste Link</h4>
            <p className="section1-content-boxes-des">
              {" "}
              Drop any YouTube URL. Our engine immediately begins analyzing
              audio, visual, and metadata layers.
            </p>
          </div>
          <div className="section1-content-boxes ">
            <LuSparkles className="section1-content-boxes-title-icons" />
            <h4 className="section1-content-boxes-title">AI Synthesis</h4>
            <p className="section1-content-boxes-des">
              {" "}
              neural network distills core concepts, removes filler, and
              categorizes information into structured insights.
            </p>
          </div>
          <div className="section1-content-boxes ">
            <FaRegFileLines className="section1-content-boxes-title-icons" />
            <h4 className="section1-content-boxes-title">Consume Fast</h4>
            <p className="section1-content-boxes-des">
              {" "}
              Read the high-level summary, scan the timestamps, or export to
              your knowledge base in seconds.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div class="row flex-lg-row-reverse align-items-center g-5 py-5">
          {" "}
          <div class="col-10 col-sm-8 col-lg-6">
            <img
              src="/img1.png"
              class="d-block mx-lg-auto img-fluid"
              alt="Bootstrap Themes"
              width="700"
              height="500"
              loading="lazy"
            />{" "}
          </div>{" "}
          <div class="col-lg-6 overall-body">
            <h1 class="display-5 fw-bold text-body-emphasis lh-1 mb-3">
              <p className="text-color-primary">
                Built for the <br />
                <p className="text-color-secondary">Knowledge Professional</p>
              </p>
            </h1>{" "}
            <div>
              <h5 className="section2-subtitle">Context-Aware AI</h5>
              <p className="section2-desc">
                Unlike generic LLMs, Lumina understands industry-specific jargon
                and technical visual cues.
              </p>
            </div>
            <div>
              <h5 className="section2-subtitle">Multi-language Mastery</h5>
              <p className="section2-desc">
                Summarize content from 50+ languages into English (or vice
                versa) with perfect cultural nuance.
              </p>
            </div>
            <div>
              <h5 className="section2-subtitle">Knowledge Export</h5>
              <p className="section2-desc">
                Directly sync with Notion, Obsidian, or export as beautifully
                formatted PDF/DOCX files.
              </p>
            </div>
          </div>{" "}
        </div>
      </section>

      <section id="pricing" className="even">
        <h1 className="title-section1" style={{"margin-bottom" : "60px"}}>
          Simple, Scalable Pricing
          <h6 style={{ color: "grey" }}>
            Choose the plan that fits your learning velocity.
          </h6>
        </h1>

        <div className="price-container">
          <div className="price-box">
            <h6 style={{color : "cyan"}}>STARTER</h6>
            <h2 >Free</h2>
            <p className="price-desc">For casual viewers exploring the power of AI synthesis.</p>
            <div>
              <p><IoCheckmarkCircleOutline className="checkmark"/>3 Summaries / month</p>
              <p><IoCheckmarkCircleOutline className="checkmark" />Max 15min per video</p>
              <p><IoCheckmarkCircleOutline className="checkmark"/>No Exporting</p>
            </div>
            <div className="pruchase">Get Started</div>
          </div>
          
          <div className="price-box" >
            <h6 style={{color : "cyan"}}>PRO</h6>
            <h2>$19/mo</h2>
            <p className="price-desc">For power learners and content curators.</p>
            <div>
              <p><IoCheckmarkCircleOutline className="checkmark"/>Unlimited Summaries</p>
              <p><IoCheckmarkCircleOutline className="checkmark"/>No video length limit</p>
              <p><IoCheckmarkCircleOutline className="checkmark"/>All Export Formats</p>
              <p><IoCheckmarkCircleOutline className="checkmark"/>Notion Sync</p>
            </div>
            <div className="pruchase">Go Pro Now</div>
          </div>

          <div className="price-box" >
            <h6 style={{color : "cyan"}}>TEAM</h6>
            <h2>Custom</h2>
            <p className="price-desc">For research labs and media agencies.</p>
            <div>
              <p><IoCheckmarkCircleOutline className="checkmark"/>Everything in Pro</p>
              <p><IoCheckmarkCircleOutline className="checkmark"/>API Access</p>
              <p><IoCheckmarkCircleOutline className="checkmark"/>Shared Workspaces</p>
            </div>
            <div className="pruchase" style={{"margin-bottom" : "0px"}}>Contact Sales</div>
          </div>
        </div>
      </section>

      <section>
        <div className="final-section">
          <h1>Ready To Evolve ?</h1>
          <p style={{ color: "grey" }}>
            Join the elite class of learners who treat time as their most
            valuable asset.
          </p>
          <p>
            <a className="Home-href" href="/">
              <IoMdHome /> Home
            </a>
          </p>
        </div>
      </section>
    </>
  );
};

export default Sections;
