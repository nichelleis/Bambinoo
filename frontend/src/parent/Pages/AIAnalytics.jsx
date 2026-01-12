import { useState } from 'react';

const AIAnalytics = () => {
  const [formData, setFormData] = useState({ age: '', weight: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/generate-plan', {
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

        
      
      ` }} />
      <div className="container">
      <h1>Nutrition Plan</h1>
      <p className="subtitle">Personalized for your child's weight</p>

      <form onSubmit={handleGenerate} className="input-section">
        <input
          type="number"
          placeholder="Age (Months)"
          required
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          required
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        />
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