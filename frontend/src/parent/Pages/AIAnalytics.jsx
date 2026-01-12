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
}

export default AIAnalytics;