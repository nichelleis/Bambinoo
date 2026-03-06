import { useState } from 'react';
import GrowthPredictionChart from '../../components/GrowthPredictionChart';

const AIAnalytics = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await fetch('http://127.0.0.1:5000/generate-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
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
    <style>{`
      .pai-page { padding: 24px; font-family: 'Nunito', sans-serif; background: #f8f9fe; min-height: 100%; }

      .pai-header {
        background: linear-gradient(135deg, #5da4fa 0%, #ff72a1 100%);
        border-radius: 18px; padding: 32px 36px; margin-bottom: 28px;
        position: relative; overflow: hidden;
        box-shadow: 0 10px 30px rgba(108, 99, 255, 0.2);
      }
      .pai-header-content { position: relative; display: flex; align-items: center; gap: 18px; }
      .pai-header-icon {
        width: 56px; height: 56px; background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.6rem; color: #fff; flex-shrink: 0;
      }
      .pai-header-text h1 { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0 0 4px; }
      .pai-header-text p  { font-size: 0.9rem; color: rgba(255,255,255,0.88); margin: 0; }

      .pai-tabs {
        display: flex; gap: 10px; margin-bottom: 24px;
        padding: 6px; background: #fff; border-radius: 14px;
        box-shadow: 0 2px 8px rgba(108,99,255,0.08); width: fit-content;
      }
      .pai-tab {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 22px; border: none; border-radius: 10px;
        font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 600;
        cursor: pointer; color: #718096; background: transparent; transition: all 0.2s ease;
      }
      .pai-tab:hover { background: #f8f9fe; color: #2d3748; }
      .pai-tab.active {
        background: linear-gradient(135deg, #5da4fa 0%, #ff72a1 100%);
        color: #fff; box-shadow: 0 4px 14px rgba(93,164,250,0.4);
      }

      .pai-card { background: #fff; border-radius: 18px; padding: 32px; box-shadow: 0 2px 8px rgba(108,99,255,0.08); }

      .pai-nutrition-title    { text-align: center; font-size: 1.6rem; font-weight: 800; color: #1e3a8a; margin: 0 0 6px; }
      .pai-nutrition-subtitle { text-align: center; color: #718096; margin: 0 0 28px; font-size: 0.95rem; }

      .pai-generate-area { display: flex; justify-content: center; align-items: center; background: #f8f9fe; border-radius: 14px; padding: 28px; margin-bottom: 24px; }
      .pai-generate-btn {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 36px; border: none; border-radius: 12px;
        font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 700; color: #fff;
        background: linear-gradient(135deg, #5da4fa 0%, #ff72a1 100%);
        cursor: pointer; transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(93,164,250,0.35);
      }
      .pai-generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(93,164,250,0.45); }
      .pai-generate-btn:disabled { opacity: 0.75; cursor: not-allowed; }

      .pai-spinner-inline { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: paiSpin 0.7s linear infinite; flex-shrink: 0; }
      @keyframes paiSpin { to { transform: rotate(360deg); } }
      .pai-loading-note { text-align: center; color: #718096; font-size: 0.9rem; margin-top: 12px; font-style: italic; }

      .pai-result { margin-top: 24px; }
      .pai-result .meal-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
      .pai-result .meal-table th { background: #2563eb; color: white; padding: 16px; text-align: left; }
      .pai-result .meal-table td { border-bottom: 1px solid #e2e8f0; padding: 16px; color: #1e293b; }
      .pai-result .summary-card { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; margin-bottom: 25px; }
      .pai-result .tips-card { background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; border-radius: 12px; margin-top: 25px; }
    `}</style>

    <div className="pai-page">

      <div className="pai-header">
        <div className="pai-header-content">
          <div className="pai-header-icon"><i className="bi bi-robot" /></div>
          <div className="pai-header-text">
            <h1>AI Analytics</h1>
            <p>Growth predictions and personalised nutrition — powered by AI</p>
          </div>
        </div>
      </div>

      <div className="pai-tabs">
        <button className={`pai-tab${activeTab === 'growth' ? ' active' : ''}`} onClick={() => setActiveTab('growth')}>
          <i className="bi bi-graph-up-arrow" /> Growth Prediction
        </button>
        <button className={`pai-tab${activeTab === 'nutrition' ? ' active' : ''}`} onClick={() => setActiveTab('nutrition')}>
          <i className="bi bi-egg-fried" /> Nutrition Plan
        </button>
      </div>

      {activeTab === 'growth' && (
        <div className="pai-card">
          <GrowthPredictionChart />
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="pai-card">
          <h2 className="pai-nutrition-title">Nutrition Plan</h2>
          <p className="pai-nutrition-subtitle">Personalised for your child's weight and age</p>
          <div className="pai-generate-area">
            <button className="pai-generate-btn" onClick={handleGenerate} disabled={loading}>
              {loading
                ? <><span className="pai-spinner-inline" /> Analyzing…</>
                : <><i className="bi bi-stars" /> Generate Plan</>
              }
            </button>
          </div>
          {loading && <p className="pai-loading-note">Generating your personalised nutrition plan…</p>}
          {result && <div className="pai-result" dangerouslySetInnerHTML={{ __html: result }} />}
        </div>
      )}

    </div>
  </>
);
};

export default AIAnalytics;