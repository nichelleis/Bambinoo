import { useState } from 'react';

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
    
    const [formData, setFormData] = useState({ age: '', concern: '' });
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/get-resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            
            if (data.success) setResult(data.html);
            else alert(data.error);
            
        } catch (err) {
            alert("Error: Python server not running on port 5000");
        }
        setLoading(false);
    };
}





export default Education;
