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
    
  );
};

export default AIAnalytics;