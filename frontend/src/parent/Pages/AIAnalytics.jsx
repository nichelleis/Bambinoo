import { useState } from 'react';

const AIAnalytics = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
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
          'Authorization': `Bearer ${token}` // Add JWT token
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
      <style dangerouslySetInnerHTML={{ __html: `
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

        button {
          padding: 14px 30px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
          color: white; background: var(--primary);
          background: linear-gradient(135deg, #5da4fa 0%, #ff72a1 100%);
        }
        button:hover { background: var(--primary-hover); }

        .meal-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .meal-table th { background: var(--primary); color: white; padding: 16px; text-align: left; }
        .meal-table td { border-bottom: 1px solid #e2e8f0; padding: 16px; color: var(--text); }
        .summary-card { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; margin-bottom: 25px; }
        .tips-card { background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; border-radius: 12px; margin-top: 25px; }
      ` }} />
      <div className="container">
      <h1>Nutrition Plan</h1>
      <p className="subtitle">Personalized for your child's weight</p>

      <form onSubmit={handleGenerate} className="input-section">
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Plan'}
        </button>
      </form>

      {loading && <p style={{ textAlign: 'center', marginTop: '20px' }}>Generating Plan...</p>}
      {result && <div style={{ marginTop: '30px' }} dangerouslySetInnerHTML={{ __html: result }} />}
    </div>
    </>
  );
};

export default AIAnalytics;