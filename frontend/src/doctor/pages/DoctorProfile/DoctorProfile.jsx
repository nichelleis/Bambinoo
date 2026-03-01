import { useState, useEffect } from "react";
import "./DoctorProfile.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const uid = () => Math.random().toString(36).slice(2, 8);

const SPECIALTIES = [
  "General Practitioner", "Pediatrician", "Cardiologist", "Dermatologist",
  "Neurologist", "Orthopedic Surgeon", "Gynecologist", "Psychiatrist",
  "Radiologist", "Anesthesiologist", "Oncologist", "Endocrinologist",
  "Gastroenterologist", "Pulmonologist", "Rheumatologist", "Urologist",
  "Ophthalmologist", "ENT Specialist", "Emergency Medicine", "Other",
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DEFAULT_AVAILABILITY = DAYS.map(d => ({ day: d, available: false, from: "09:00", to: "17:00" }));

// ── display helpers ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }) {
  return (
    <div className="dp-section-header">
      <span className="dp-section-icon">{icon}</span>
      <h3>{title}</h3>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="dp-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ViewField({ label, value, fullWidth }) {
  return (
    <div className="dp-field" style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{label}</label>
      <div className="dp-view-value">{value || <span style={{ color: "#d1d5db" }}>—</span>}</div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="dp-field">
      <label>{label}</label>
      <input value={value || ""} readOnly style={{ background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed", border: "1px solid #e5e7eb" }} />
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) { onAdd(t); setVal(""); }
  };
  return (
    <div className="dp-tag-input">
      <div className="dp-tags">
        {tags.map((t, i) => (
          <span key={i} className="dp-tag">
            {t}<button onClick={() => onRemove(i)}>×</button>
          </span>
        ))}
      </div>
      <div className="dp-tag-row">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder} />
        <button className="dp-tag-add" onClick={add}>Add</button>
      </div>
    </div>
  );
}

function TagDisplay({ tags }) {
  if (!tags || tags.length === 0) return <span style={{ color: "#d1d5db" }}>—</span>;
  return (
    <div className="dp-tags" style={{ marginTop: 4 }}>
      {tags.map((t, i) => <span key={i} className="dp-tag" style={{ cursor: "default" }}>{t}</span>)}
    </div>
  );
}

function StatusBanner({ status }) {
  if (!status) return null;
  const styles = {
    saving:  { background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" },
    success: { background: "#f0fdf4", color: "#166534", border: "1px solid #86efac" },
    error:   { background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" },
  };
  const labels = { saving: "⏳ Saving…", success: "✓ Profile saved!", error: "✗ Save failed. Please try again." };
  return (
    <div style={{ ...styles[status.type], borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontWeight: 500 }}>
      {labels[status.type]}
      {status.type === "error" && status.message && <span style={{ fontSize: 13, marginLeft: 8 }}>{status.message}</span>}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function DoctorProfile() {
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [status,   setStatus]   = useState(null);
  const [avatar,   setAvatar]   = useState(null);

  const [basic, setBasic] = useState({
    firstName: "", lastName: "", title: "Dr.", gender: "",
    dob: "", phone: "", email: "", bio: "",
  });
  const [professional, setProfessional] = useState({
    specialty: "", subSpecialty: "", licenseNumber: "", licenseExpiry: "",
    slmcNumber: "", yearsExperience: "", currentHospital: "", department: "", consultationFee: "",
  });
  const [qualifications, setQualifications] = useState([]);
  const [experience,     setExperience]     = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [languages,      setLanguages]      = useState([]);
  const [expertise,      setExpertise]      = useState([]);
  const [publications,   setPublications]   = useState([]);
  const [availability,   setAvailability]   = useState(DEFAULT_AVAILABILITY);
  const [emergency,      setEmergency]      = useState({ available: false, maxPatients: "", telehealth: false });

  // snapshot for cancel
  const [snapshot, setSnapshot] = useState(null);

  const loadProfile = () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch(`${API_BASE}/doctor-profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAvatar(data.avatar || null);
        setBasic(data.basic || {});
        setProfessional(data.professional || {});
        const withId = arr => (arr || []).map(x => ({ id: uid(), ...x }));
        setQualifications(withId(data.qualifications));
        setExperience(withId(data.experience));
        setCertifications(withId(data.certifications));
        setLanguages(data.languages || []);
        setExpertise(data.expertise || []);
        setPublications(withId(data.publications));
        if (data.availability && data.availability.length === 7) setAvailability(data.availability);
        if (data.emergency) setEmergency(data.emergency);
      })
      .catch(err => console.error("Failed to load doctor profile:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleEdit = () => {
    setSnapshot({ avatar, basic, professional, qualifications, experience, certifications, languages, expertise, publications, availability, emergency });
    setEditing(true);
  };

  const handleCancel = () => {
    if (snapshot) {
      setAvatar(snapshot.avatar);
      setBasic(snapshot.basic);
      setProfessional(snapshot.professional);
      setQualifications(snapshot.qualifications);
      setExperience(snapshot.experience);
      setCertifications(snapshot.certifications);
      setLanguages(snapshot.languages);
      setExpertise(snapshot.expertise);
      setPublications(snapshot.publications);
      setAvailability(snapshot.availability);
      setEmergency(snapshot.emergency);
    }
    setEditing(false);
    setSnapshot(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setStatus({ type: "saving" });
    const stripId = arr => arr.map(({ id, ...rest }) => rest);
    const payload = { avatar, basic, professional, qualifications: stripId(qualifications), experience: stripId(experience), certifications: stripId(certifications), languages, expertise, publications: stripId(publications), availability, emergency };

    try {
      const res = await fetch(`${API_BASE}/doctor-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setStatus({ type: "success" });
      setEditing(false);
      setSnapshot(null);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addQual    = () => setQualifications(q => [...q, { id: uid(), degree: "", institution: "", year: "", country: "" }]);
  const updateQual = (id, k, v) => setQualifications(q => q.map(x => x.id === id ? { ...x, [k]: v } : x));
  const removeQual = id => setQualifications(q => q.filter(x => x.id !== id));

  const addExp    = () => setExperience(e => [...e, { id: uid(), role: "", hospital: "", from: "", to: "", current: false }]);
  const updateExp = (id, k, v) => setExperience(e => e.map(x => x.id === id ? { ...x, [k]: v } : x));
  const removeExp = id => setExperience(e => e.filter(x => x.id !== id));

  const addCert    = () => setCertifications(c => [...c, { id: uid(), name: "", issuingBody: "", issueDate: "", expiryDate: "" }]);
  const updateCert = (id, k, v) => setCertifications(c => c.map(x => x.id === id ? { ...x, [k]: v } : x));
  const removeCert = id => setCertifications(c => c.filter(x => x.id !== id));

  const addPub    = () => setPublications(p => [...p, { id: uid(), title: "", journal: "", year: "" }]);
  const updatePub = (id, k, v) => setPublications(p => p.map(x => x.id === id ? { ...x, [k]: v } : x));
  const removePub = id => setPublications(p => p.filter(x => x.id !== id));

  const toggleDay = idx => setAvailability(a => a.map((d, i) => i === idx ? { ...d, available: !d.available } : d));
  const updateDay = (idx, k, v) => setAvailability(a => a.map((d, i) => i === idx ? { ...d, [k]: v } : d));

  const initials = `${basic.firstName?.[0] || ""}${basic.lastName?.[0] || ""}` || "DR";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
        <p style={{ color: "#6b7280", fontSize: 16 }}>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="dp-page">

      {/* ── hero ── */}
      <div className="dp-hero">
        <div className="dp-avatar-wrap">
          <div className="dp-avatar">
            {avatar ? <img src={avatar} alt="Profile" /> : <span>{initials}</span>}
          </div>
          {editing && (
            <label className="dp-avatar-edit" title="Change photo">
              <i className="ri-camera-line" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
          )}
        </div>
        <div className="dp-hero-info">
          <h1>{basic.title} {basic.firstName || "First Name"} {basic.lastName || "Last Name"}</h1>
          <p className="dp-hero-specialty">
            {professional.specialty || "Specialty not set"}
            {professional.subSpecialty ? ` · ${professional.subSpecialty}` : ""}
          </p>
          <p className="dp-hero-hospital">
            {professional.currentHospital || "Hospital / Clinic not set"}
            {professional.department ? ` — ${professional.department}` : ""}
          </p>
          <div className="dp-hero-tags">
            {professional.licenseNumber && <span className="dp-badge">Lic: {professional.licenseNumber}</span>}
            {professional.yearsExperience && <span className="dp-badge">{professional.yearsExperience} yrs exp.</span>}
            {emergency.telehealth && <span className="dp-badge dp-badge-green">Telehealth</span>}
            {emergency.available && <span className="dp-badge dp-badge-red">Emergency Available</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!editing ? (
            <button className="dp-save-btn" onClick={handleEdit}>Edit Profile</button>
          ) : (
            <>
              <button className="dp-save-btn" onClick={handleSave} disabled={status?.type === "saving"}>
                {status?.type === "saving" ? "Saving…" : "Save Changes"}
              </button>
              <button className="dp-cancel-btn" onClick={handleCancel}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="dp-body">
        <StatusBanner status={status} />

        <section className="dp-card">
          <SectionHeader  title="Personal Information" />

          {editing ? (
            <>
              <div className="dp-grid-3">
                <Field label="Title">
                  <select value={basic.title} onChange={e => setBasic({ ...basic, title: e.target.value })}>
                    {["Dr.","Prof.","Mr.","Ms.","Mrs."].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <ReadOnlyField label="First Name" value={basic.firstName} />
                <ReadOnlyField label="Last Name"  value={basic.lastName}  />
                <Field label="Gender">
                  <select value={basic.gender} onChange={e => setBasic({ ...basic, gender: e.target.value })}>
                    <option value="">Select</option>
                    {["Male","Female","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Date of Birth">
                  <input type="date" value={basic.dob} onChange={e => setBasic({ ...basic, dob: e.target.value })} />
                </Field>
                <Field label="Contact Number">
                  <input value={basic.phone} placeholder="+94 77 123 4567" onChange={e => setBasic({ ...basic, phone: e.target.value })} />
                </Field>
                <ReadOnlyField label="Email Address" value={basic.email} />
              </div>
              <Field label="Professional Bio">
                <textarea rows={4} value={basic.bio}
                  placeholder="Brief description about your practice philosophy..."
                  onChange={e => setBasic({ ...basic, bio: e.target.value })} />
              </Field>
            </>
          ) : (
            <>
              <div className="dp-grid-3">
                <ViewField label="Title"          value={basic.title} />
                <ViewField label="First Name"     value={basic.firstName} />
                <ViewField label="Last Name"      value={basic.lastName} />
                <ViewField label="Gender"         value={basic.gender} />
                <ViewField label="Date of Birth"  value={basic.dob} />
                <ViewField label="Contact Number" value={basic.phone} />
                <ViewField label="Email Address"  value={basic.email} />
              </div>
              <ViewField label="Professional Bio" value={basic.bio} fullWidth />
            </>
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Professional Details" />

          {editing ? (
            <div className="dp-grid-3">
              <Field label="Specialty">
                <select value={professional.specialty} onChange={e => setProfessional({ ...professional, specialty: e.target.value })}>
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Sub-Specialty">
                <input value={professional.subSpecialty} placeholder="e.g. Pediatric Cardiology" onChange={e => setProfessional({ ...professional, subSpecialty: e.target.value })} />
              </Field>
              <Field label="Years of Experience">
                <input type="number" min="0" value={professional.yearsExperience} placeholder="e.g. 12" onChange={e => setProfessional({ ...professional, yearsExperience: e.target.value })} />
              </Field>
              <Field label="Medical License No.">
                <input value={professional.licenseNumber} placeholder="LIC-XXXXX" onChange={e => setProfessional({ ...professional, licenseNumber: e.target.value })} />
              </Field>
              <Field label="License Expiry Date">
                <input type="date" value={professional.licenseExpiry} onChange={e => setProfessional({ ...professional, licenseExpiry: e.target.value })} />
              </Field>
              <Field label="SLMC Registration No.">
                <input value={professional.slmcNumber} placeholder="SLMC-XXXXX" onChange={e => setProfessional({ ...professional, slmcNumber: e.target.value })} />
              </Field>
              <Field label="Current Hospital / Clinic">
                <input value={professional.currentHospital} placeholder="e.g. National Hospital Colombo" onChange={e => setProfessional({ ...professional, currentHospital: e.target.value })} />
              </Field>
              <Field label="Department">
                <input value={professional.department} placeholder="e.g. Pediatrics" onChange={e => setProfessional({ ...professional, department: e.target.value })} />
              </Field>
              <Field label="Consultation Fee (LKR)">
                <input type="number" min="0" value={professional.consultationFee} placeholder="e.g. 3000" onChange={e => setProfessional({ ...professional, consultationFee: e.target.value })} />
              </Field>
            </div>
          ) : (
            <div className="dp-grid-3">
              <ViewField label="Specialty"            value={professional.specialty} />
              <ViewField label="Sub-Specialty"        value={professional.subSpecialty} />
              <ViewField label="Years of Experience"  value={professional.yearsExperience} />
              <ViewField label="Medical License No."  value={professional.licenseNumber} />
              <ViewField label="License Expiry"       value={professional.licenseExpiry} />
              <ViewField label="SLMC Registration"    value={professional.slmcNumber} />
              <ViewField label="Hospital / Clinic"    value={professional.currentHospital} />
              <ViewField label="Department"           value={professional.department} />
              <ViewField label="Consultation Fee (LKR)" value={professional.consultationFee} />
            </div>
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Academic Qualifications" />

          {editing ? (
            <>
              <p className="dp-hint">Add your degrees — MBBS, MD, MS, Fellowship, etc.</p>
              {qualifications.map((q, idx) => (
                <div key={q.id} className="dp-entry-row">
                  <div className="dp-entry-number">{idx + 1}</div>
                  <div className="dp-entry-fields dp-grid-2">
                    <Field label="Degree / Qualification">
                      <input value={q.degree} placeholder="e.g. MBBS" onChange={e => updateQual(q.id, "degree", e.target.value)} />
                    </Field>
                    <Field label="Institution / University">
                      <input value={q.institution} placeholder="e.g. University of Colombo" onChange={e => updateQual(q.id, "institution", e.target.value)} />
                    </Field>
                    <Field label="Year of Completion">
                      <input type="number" min="1950" max="2099" value={q.year} placeholder="e.g. 2010" onChange={e => updateQual(q.id, "year", e.target.value)} />
                    </Field>
                    <Field label="Country">
                      <input value={q.country} placeholder="e.g. Sri Lanka" onChange={e => updateQual(q.id, "country", e.target.value)} />
                    </Field>
                  </div>
                  <button className="dp-remove-btn" onClick={() => removeQual(q.id)}>×</button>
                </div>
              ))}
              <button className="dp-add-btn" onClick={addQual}>+ Add Qualification</button>
            </>
          ) : (
            qualifications.length === 0
              ? <p className="dp-hint">No qualifications added.</p>
              : qualifications.map((q, idx) => (
                <div key={q.id} className="dp-view-entry">
                  <div className="dp-view-entry-number">{idx + 1}</div>
                  <div className="dp-grid-2" style={{ flex: 1 }}>
                    <ViewField label="Degree"      value={q.degree} />
                    <ViewField label="Institution" value={q.institution} />
                    <ViewField label="Year"        value={q.year} />
                    <ViewField label="Country"     value={q.country} />
                  </div>
                </div>
              ))
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Work Experience" />

          {editing ? (
            <>
              <p className="dp-hint">List your hospital roles, residencies, fellowships, and past positions.</p>
              {experience.map((e, idx) => (
                <div key={e.id} className="dp-entry-row">
                  <div className="dp-entry-number">{idx + 1}</div>
                  <div className="dp-entry-fields">
                    <div className="dp-grid-2">
                      <Field label="Role / Position">
                        <input value={e.role} placeholder="e.g. Consultant Pediatrician" onChange={ev => updateExp(e.id, "role", ev.target.value)} />
                      </Field>
                      <Field label="Hospital / Institution">
                        <input value={e.hospital} placeholder="e.g. Lady Ridgeway Hospital" onChange={ev => updateExp(e.id, "hospital", ev.target.value)} />
                      </Field>
                      <Field label="From">
                        <input type="month" value={e.from} onChange={ev => updateExp(e.id, "from", ev.target.value)} />
                      </Field>
                      <Field label="To">
                        <input type="month" value={e.to} disabled={e.current} onChange={ev => updateExp(e.id, "to", ev.target.value)} />
                      </Field>
                    </div>
                    <label className="dp-check-label">
                      <input type="checkbox" checked={e.current} onChange={ev => updateExp(e.id, "current", ev.target.checked)} />
                      Currently working here
                    </label>
                  </div>
                  <button className="dp-remove-btn" onClick={() => removeExp(e.id)}>×</button>
                </div>
              ))}
              <button className="dp-add-btn" onClick={addExp}>+ Add Experience</button>
            </>
          ) : (
            experience.length === 0
              ? <p className="dp-hint">No experience added.</p>
              : experience.map((e, idx) => (
                <div key={e.id} className="dp-view-entry">
                  <div className="dp-view-entry-number">{idx + 1}</div>
                  <div className="dp-grid-2" style={{ flex: 1 }}>
                    <ViewField label="Role"     value={e.role} />
                    <ViewField label="Hospital" value={e.hospital} />
                    <ViewField label="From"     value={e.from} />
                    <ViewField label="To"       value={e.current ? "Present" : e.to} />
                  </div>
                </div>
              ))
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Certifications & Board Memberships" />

          {editing ? (
            <>
              <p className="dp-hint">Include board certifications, professional memberships, and specialist registrations.</p>
              {certifications.map((c, idx) => (
                <div key={c.id} className="dp-entry-row">
                  <div className="dp-entry-number">{idx + 1}</div>
                  <div className="dp-entry-fields dp-grid-2">
                    <Field label="Certification Name">
                      <input value={c.name} placeholder="e.g. Board Certified Pediatrician" onChange={e => updateCert(c.id, "name", e.target.value)} />
                    </Field>
                    <Field label="Issuing Body">
                      <input value={c.issuingBody} placeholder="e.g. Sri Lanka College of Pediatricians" onChange={e => updateCert(c.id, "issuingBody", e.target.value)} />
                    </Field>
                    <Field label="Issue Date">
                      <input type="date" value={c.issueDate} onChange={e => updateCert(c.id, "issueDate", e.target.value)} />
                    </Field>
                    <Field label="Expiry Date">
                      <input type="date" value={c.expiryDate} onChange={e => updateCert(c.id, "expiryDate", e.target.value)} />
                    </Field>
                  </div>
                  <button className="dp-remove-btn" onClick={() => removeCert(c.id)}>×</button>
                </div>
              ))}
              <button className="dp-add-btn" onClick={addCert}>+ Add Certification</button>
            </>
          ) : (
            certifications.length === 0
              ? <p className="dp-hint">No certifications added.</p>
              : certifications.map((c, idx) => (
                <div key={c.id} className="dp-view-entry">
                  <div className="dp-view-entry-number">{idx + 1}</div>
                  <div className="dp-grid-2" style={{ flex: 1 }}>
                    <ViewField label="Certification" value={c.name} />
                    <ViewField label="Issuing Body"  value={c.issuingBody} />
                    <ViewField label="Issue Date"    value={c.issueDate} />
                    <ViewField label="Expiry Date"   value={c.expiryDate} />
                  </div>
                </div>
              ))
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Areas of Expertise" />
          {editing ? (
            <>
              <p className="dp-hint">Add conditions treated, procedures performed, or clinical focus areas.</p>
              <TagInput tags={expertise} onAdd={t => setExpertise(x => [...x, t])} onRemove={i => setExpertise(x => x.filter((_, j) => j !== i))} placeholder="e.g. Congenital Heart Disease, press Enter" />
            </>
          ) : (
            <TagDisplay tags={expertise} />
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Languages Spoken" />
          {editing ? (
            <>
              <p className="dp-hint">Languages you can consult in with patients.</p>
              <TagInput tags={languages} onAdd={t => setLanguages(l => [...l, t])} onRemove={i => setLanguages(l => l.filter((_, j) => j !== i))} placeholder="e.g. Sinhala, Tamil, English — press Enter" />
            </>
          ) : (
            <TagDisplay tags={languages} />
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Publications & Research" />

          {editing ? (
            <>
              <p className="dp-hint">List peer-reviewed papers, journal articles, or notable research contributions.</p>
              {publications.map((p, idx) => (
                <div key={p.id} className="dp-entry-row">
                  <div className="dp-entry-number">{idx + 1}</div>
                  <div className="dp-entry-fields dp-grid-2">
                    <Field label="Title">
                      <input value={p.title} placeholder="Publication title" style={{ gridColumn: "1 / -1" }} onChange={e => updatePub(p.id, "title", e.target.value)} />
                    </Field>
                    <Field label="Journal / Conference">
                      <input value={p.journal} placeholder="e.g. The Lancet" onChange={e => updatePub(p.id, "journal", e.target.value)} />
                    </Field>
                    <Field label="Year">
                      <input type="number" min="1950" max="2099" value={p.year} placeholder="e.g. 2022" onChange={e => updatePub(p.id, "year", e.target.value)} />
                    </Field>
                  </div>
                  <button className="dp-remove-btn" onClick={() => removePub(p.id)}>×</button>
                </div>
              ))}
              <button className="dp-add-btn" onClick={addPub}>+ Add Publication</button>
            </>
          ) : (
            publications.length === 0
              ? <p className="dp-hint">No publications added.</p>
              : publications.map((p, idx) => (
                <div key={p.id} className="dp-view-entry">
                  <div className="dp-view-entry-number">{idx + 1}</div>
                  <div className="dp-grid-2" style={{ flex: 1 }}>
                    <ViewField label="Title"   value={p.title}   fullWidth />
                    <ViewField label="Journal" value={p.journal} />
                    <ViewField label="Year"    value={p.year} />
                  </div>
                </div>
              ))
          )}
        </section>

        <section className="dp-card">
          <SectionHeader title="Consultation Availability" />

          {editing ? (
            <>
              <p className="dp-hint">Set your available days and consultation hours.</p>
              <div className="dp-availability">
                {availability.map((d, i) => (
                  <div key={d.day} className={`dp-day-row ${d.available ? "dp-day-active" : ""}`}>
                    <label className="dp-day-toggle">
                      <input type="checkbox" checked={d.available} onChange={() => toggleDay(i)} />
                      <span className="dp-day-name">{d.day}</span>
                    </label>
                    {d.available && (
                      <div className="dp-day-times">
                        <input type="time" value={d.from} onChange={e => updateDay(i, "from", e.target.value)} />
                        <span className="dp-time-sep">to</span>
                        <input type="time" value={d.to} onChange={e => updateDay(i, "to", e.target.value)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="dp-avail-extras">
                <label className="dp-check-label">
                  <input type="checkbox" checked={emergency.available} onChange={e => setEmergency({ ...emergency, available: e.target.checked })} />
                  Available for emergency consultations
                </label>
                <label className="dp-check-label">
                  <input type="checkbox" checked={emergency.telehealth} onChange={e => setEmergency({ ...emergency, telehealth: e.target.checked })} />
                  Offers telehealth / online consultations
                </label>
                <Field label="Max Patients per Day">
                  <input type="number" min="1" value={emergency.maxPatients} placeholder="e.g. 30" onChange={e => setEmergency({ ...emergency, maxPatients: e.target.value })} />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="dp-availability">
                {availability.map(d => (
                  <div key={d.day} className={`dp-day-row ${d.available ? "dp-day-active" : ""}`} style={{ cursor: "default" }}>
                    <span className="dp-day-name" style={{ fontWeight: d.available ? 600 : 400, color: d.available ? "#111827" : "#9ca3af" }}>
                      {d.available ? "✓" : "✗"} {d.day}
                    </span>
                    {d.available && (
                      <div className="dp-day-times" style={{ pointerEvents: "none" }}>
                        <span>{d.from}</span>
                        <span className="dp-time-sep">to</span>
                        <span>{d.to}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="dp-avail-extras" style={{ marginTop: 12 }}>
                <p style={{ margin: "4px 0", color: emergency.available ? "#166534" : "#6b7280" }}>
                  {emergency.available ? "✓" : "✗"} Emergency consultations
                </p>
                <p style={{ margin: "4px 0", color: emergency.telehealth ? "#166534" : "#6b7280" }}>
                  {emergency.telehealth ? "✓" : "✗"} Telehealth / online consultations
                </p>
                {emergency.maxPatients && (
                  <p style={{ margin: "4px 0", color: "#374151" }}>Max patients per day: <strong>{emergency.maxPatients}</strong></p>
                )}
              </div>
            </>
          )}
        </section>

      </div>

      {editing && (
        <div className="dp-footer">
          <p className="dp-footer-note">Changes are saved to your profile and visible to clinic administrators.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="dp-cancel-btn" onClick={handleCancel}>Cancel</button>
            <button className="dp-save-btn" onClick={handleSave} disabled={status?.type === "saving"}>
              {status?.type === "saving" ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
