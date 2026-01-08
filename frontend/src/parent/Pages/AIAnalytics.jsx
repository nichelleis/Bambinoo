import { useState } from 'react';
import './App.css';

// Component for generating AI-powered nutrition plans based on child's age and weight
const AIAnalytics = () => {
  // Manages the form data: child's age in months and weight in kg
  const [formData, setFormData] = useState({ age: '', weight: '' });
  // Holds the HTML content of the generated nutrition plan from the server
  const [result, setResult] = useState(null);
  // Controls the loading state during the API request
  const [loading, setLoading] = useState(false);

  // Function to handle form submission and fetch nutrition plan from backend
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // Send POST request to backend API with form data
      const res = await fetch('http://127.0.0.1:5000/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // If successful, display the HTML result otherwise show error
      if (data.success) setResult(data.html);
      else alert(data.error);
    } catch (err) {
      // Alert user if backend server is not running
      alert("Error: Python server not running on port 5000");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Nutrition Plan</h1>
      <p className="subtitle">Personalized for your child's weight</p>

      {/* Form for entering child's age and weight */}
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

      {/* Show loading message while processing */}
      {loading && <p style={{ textAlign: 'center' }}>Generating Plan...</p>}
      {/* Render the generated plan HTML if available */}
      {result && <div dangerouslySetInnerHTML={{ __html: result }} />}
    </div>
  );
};

export default AIAnalytics;