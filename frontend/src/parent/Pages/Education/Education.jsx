import { useState } from "react";

// Default HTML content displayed initially with trending books and videos
const DEFAULT_CONTENT = `
  <h2 class="section-title">Trending this Week</h2>
  <div class="media-grid">
      <div class="book-card">
          <h4><a href="https://www.amazon.com/s?k=The+Whole-Brain+Child" target="_blank">The Whole-Brain Child</a></h4>
          <p class="author">by Daniel J. Siegel</p>
          <p class="desc">Strategies to nurture your child's developing mind.</p>
      </div>
      <div class="book-card">
          <h4><a href="https://www.amazon.com/s?k=Goodnight+Moon" target="_blank">Goodnight Moon</a></h4>
          <p class="author">by Margaret Wise Brown</p>
          <p class="desc">The classic bedtime story for calming down toddlers.</p>
      </div>
      <div class="book-card">
          <h4><a href="https://www.amazon.com/s?k=What+to+Expect+the+First+Year" target="_blank">What to Expect the First Year</a></h4>
          <p class="author">by Heidi Murkoff</p>
          <p class="desc">The comprehensive guide for new parents.</p>
      </div>
  </div>

  <h2 class="section-title">Expert Watchlist</h2>
  <div class="media-grid">
      <div class="video-card">
          <div class="video-thumb">
              <img src="https://loremflickr.com/320/180/baby,sleep?random=10" alt="Thumbnail">
              <span class="play-icon">▶</span>
          </div>
          <div class="video-info">
              <h4><a href="https://www.youtube.com/results?search_query=Baby+Sleep+Music" target="_blank">Instant Sleep Music</a></h4>
              <p class="channel">Lullaby World</p>
          </div>
      </div>
      <div class="video-card">
          <div class="video-thumb">
              <img src="https://loremflickr.com/320/180/toddler,play?random=11" alt="Thumbnail">
              <span class="play-icon">▶</span>
          </div>
          <div class="video-info">
              <h4><a href="https://www.youtube.com/results?search_query=Montessori+At+Home" target="_blank">Montessori Play Guide</a></h4>
              <p class="channel">The Montessori Way</p>
          </div>
      </div>
  </div>
`;

function Education() {
  const [result, setResult] = useState(DEFAULT_CONTENT);
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await fetch(
        "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/get-resources",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ concern }),
        },
      );
      const data = await res.json();

      if (data.success) setResult(data.html);
      else alert(data.error);
    } catch (err) {
      alert("Error: Python server not running on port 5000");
    }
    setLoading(false);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --primary: #2563eb;
          --primary-dark: #1e3a8a;
          --primary-hover: #ff72a1;
          --bg-blue: #eff6ff;
          --white: #ffffff;
          --text: #1e293b;
          --gray-soft: #f1f5f9;
        }

        .container {
          background-color: var(--white);
          width: 100%;
          max-width: 900px;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
        }

        h1 { color: var(--primary-dark); text-align: center; margin-bottom: 10px; margin-top: 0; }
        .subtitle { color: #64748b; text-align: center; margin-bottom: 40px; display: block; }

        .input-section {
          display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap;
          background: var(--gray-soft); padding: 25px; border-radius: 16px; margin-bottom: 30px;
        }
        input, select {
          padding: 14px 20px; border: 2px solid #cbd5e1; border-radius: 10px; font-size: 16px;
          background: white; color: var(--text); outline: none;
        }
        input:focus, select:focus { border-color: var(--primary); }

        button {
          padding: 14px 30px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
          color: white; background: var(--primary);
          background: linear-gradient(135deg, #5da4fa 0%, #ff72a1 100%);
        }
        button:hover { background: var(--primary-hover); }

        .section-title {
            margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;
            color: var(--primary-dark); font-size: 1.5em; font-weight: 700;
        }
        .media-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px; margin-top: 24px;
        }

        .book-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-top: 5px solid var(--primary);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            display: flex; flex-direction: column; justify-content: center;
            height: auto; min-height: 160px;
        }
        .book-card h4 { margin: 0 0 5px 0; font-size: 1.1em; }
        .book-card h4 a {
            color: var(--primary);
            text-decoration: none;
            display: block;
        }
        .book-card h4 a:hover { text-decoration: underline; }

        .book-card .author { font-weight: bold; font-size: 0.9em; color: #64748b; margin-bottom: 10px; }
        .book-card .desc { font-size: 0.9em; color: #334155; line-height: 1.5; }

        .video-card {
            background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .video-thumb { height: 160px; position: relative; background: #000; }
        .video-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.85; }
        .play-icon {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(37, 99, 235, 0.9); color: white; width: 48px; height: 48px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 24px; padding-left: 4px;
                }
        .video-info { padding: 16px; }
        .video-info h4 { margin: 0 0 5px 0; }
        .video-info h4 a { color: var(--text); text-decoration: none; font-size: 1em; font-weight: bold; }
        .video-info .channel { font-size: 0.85em; color: #64748b; }

        
            `,
        }}
      />
      <div className="container">
        <h1>Parenting Resource Hub</h1>
        <p className="subtitle">Books and videos for the journey</p>

        <form onSubmit={handleSearch} className="input-section">
          <select
            required
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          >
            <option value="" disabled>
              Select Topic
            </option>
            <option>Sleep Training</option>
            <option>Starting Solids</option>
            <option>Tantrums</option>
            <option>Speech Development</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Find Resources"}
          </button>
        </form>

        {loading && <p style={{ textAlign: "center" }}>Searching...</p>}

        {result && <div dangerouslySetInnerHTML={{ __html: result }} />}
      </div>
    </>
  );
}

export default Education;
