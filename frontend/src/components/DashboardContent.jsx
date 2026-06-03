import { BiSolidVideos } from "react-icons/bi";
import { LuSparkles, LuDownload, LuBookmark, LuLink, LuPlus } from "react-icons/lu";
import { FiMoreVertical } from "react-icons/fi";

const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      {/* 4 Stat Cards Row */}
      <div className="row g-4 mb-4">
        {/* Card 1 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <BiSolidVideos />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Videos</span>
              <h2 className="stat-value">1,284</h2>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <LuSparkles />
            </div>
            <div className="stat-info">
              <span className="stat-label">Recent Summaries</span>
              <h2 className="stat-value">42</h2>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <LuDownload />
            </div>
            <div className="stat-info">
              <span className="stat-label">Downloads</span>
              <h2 className="stat-value">856</h2>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <LuBookmark />
            </div>
            <div className="stat-info">
              <span className="stat-label">Saved Items</span>
              <h2 className="stat-value">118</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Generate */}
      <div className="row g-4">
        {/* Left Column: Recent Activity */}
        <div className="col-12 col-lg-8">
          <div className="activity-card">
            <div className="activity-header d-flex justify-content-between align-items-center mb-4">
              <h4 className="activity-title m-0">Recent Activity</h4>
              <a href="#" className="view-all-link">View All</a>
            </div>

            <div className="activity-list d-flex flex-column gap-3">
              {/* Row 1 */}
              <div className="activity-item d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="video-thumbnail-placeholder" style={{ background: 'linear-gradient(135deg, #1e1e2f 0%, #111 100%)' }}>
                    <div className="thumb-lines"></div>
                  </div>
                  <div className="video-details">
                    <h6 className="video-title m-0">AI Ethics Summit Recap</h6>
                    <span className="video-meta">04:22 • 4K HDR</span>
                  </div>
                </div>
                <div className="video-date">Oct 24, 2024</div>
                <div className="d-flex align-items-center gap-3">
                  <span className="status-badge badge-processing">
                    <span className="status-dot"></span> Processing
                  </span>
                  <button className="action-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="activity-item d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="video-thumbnail-placeholder" style={{ background: 'linear-gradient(135deg, #2c1e2f 0%, #111 100%)' }}>
                    <div className="thumb-lines"></div>
                  </div>
                  <div className="video-details">
                    <h6 className="video-title m-0">Robotics Trends 2025</h6>
                    <span className="video-meta">12:15 • HD</span>
                  </div>
                </div>
                <div className="video-date">Oct 23, 2024</div>
                <div className="d-flex align-items-center gap-3">
                  <span className="status-badge badge-completed">
                    <span className="status-dot"></span> Completed
                  </span>
                  <button className="action-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>

              {/* Row 3 */}
              <div className="activity-item d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="video-thumbnail-placeholder" style={{ background: 'linear-gradient(135deg, #1e2f2c 0%, #111 100%)' }}>
                    <div className="thumb-lines"></div>
                  </div>
                  <div className="video-details">
                    <h6 className="video-title m-0">Neural Art Breakdown</h6>
                    <span className="video-meta">00:45 • 4K</span>
                  </div>
                </div>
                <div className="video-date">Oct 21, 2024</div>
                <div className="d-flex align-items-center gap-3">
                  <span className="status-badge badge-completed">
                    <span className="status-dot"></span> Completed
                  </span>
                  <button className="action-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          <div className="quick-generate-card">
            <h4 className="card-title mb-2">Quick Generate</h4>
            <p className="card-subtitle mb-4">Drop a URL or text to start your next AI synthesis.</p>
            <div className="input-group-custom mb-3">
              <span className="input-icon"><LuLink /></span>
              <input type="text" placeholder="https://youtube.com/..." className="form-control-custom" />
            </div>
            <button className="btn-generate w-100">
              <LuSparkles /> Start Generating
            </button>
          </div>

          {/* Monthly Usage */}
          {/* <div className="usage-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title m-0">Monthly Usage</h5>
              <span className="usage-percent">84% Used</span>
            </div>
            <div className="progress-bar-custom mb-3">
              <div className="progress-fill" style={{ width: '84%' }}></div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="usage-detail">U40 / 1,000 mins</span>
              <a href="#" className="manage-plan-link">Manage Plan</a>
            </div>
          </div> */}
        </div>
      </div>

      <button className="fab-button">
        <LuPlus />
      </button>
    </div>
  );
};

export default DashboardContent;
