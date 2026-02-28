import { useState } from "react";
import "./DoctorProfile.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const SPECIALTIES = [
  "General Practitioner", "Pediatrician", "Cardiologist", "Dermatologist",
  "Neurologist", "Orthopedic Surgeon", "Gynecologist", "Psychiatrist",
  "Radiologist", "Anesthesiologist", "Oncologist", "Endocrinologist",
  "Gastroenterologist", "Pulmonologist", "Rheumatologist", "Urologist",
  "Ophthalmologist", "ENT Specialist", "Emergency Medicine", "Other",
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ── tiny sub-components ───────────────────────────────────────────────────────
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
            {t}
            <button onClick={() => onRemove(i)}>×</button>
          </span>
        ))}
      </div>
      <div className="dp-tag-row">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
        />
        <button className="dp-tag-add" onClick={add}>Add</button>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function DoctorProfile({ doctor = {} }) {

  // ── state ─────────────────────────────────────────────────────────────────
  const [saved, setSaved]   = useState(false);
  const [avatar, setAvatar] = useState(doctor.avatar || null);

  const [basic, setBasic] = useState({
    firstName:    doctor.firstName    || "",
    lastName:     doctor.lastName     || "",
    title:        doctor.title        || "Dr.",
    gender:       doctor.gender       || "",
    dob:          doctor.dob          || "",
    phone:        doctor.phone        || "",
    email:        doctor.email        || "",
    bio:          doctor.bio          || "",
  });

  const [professional, setProfessional] = useState({
    specialty:         doctor.specialty         || "",
    subSpecialty:      doctor.subSpecialty       || "",
    licenseNumber:     doctor.licenseNumber      || "",
    licenseExpiry:     doctor.licenseExpiry      || "",
    slmcNumber:        doctor.slmcNumber         || "",       // Sri Lanka Medical Council
    yearsExperience:   doctor.yearsExperience    || "",
    currentHospital:   doctor.currentHospital    || "",
    department:        doctor.department         || "",
    consultationFee:   doctor.consultationFee    || "",
  });

  const [qualifications, setQualifications] = useState(
    doctor.qualifications || []
    // each: { id, degree, institution, year, country }
  );

  const [experience, setExperience] = useState(
    doctor.experience || []
    // each: { id, role, hospital, from, to, current }
  );

  const [certifications, setCertifications] = useState(
    doctor.certifications || []
    // each: { id, name, issuingBody, issueDate, expiryDate }
  );

  const [languages,   setLanguages]   = useState(doctor.languages   || []);
  const [expertise,   setExpertise]   = useState(doctor.expertise    || []);
  const [publications,setPublications]= useState(doctor.publications || []);
  // each pub: { id, title, journal, year }

  const [availability, setAvailability] = useState(
    doctor.availability || DAYS.map(d => ({ day: d, available: false, from: "09:00", to: "17:00" }))
  );

  const [emergency, setEmergency] = useState({
    available:  doctor.emergency?.available  ?? false,
    maxPatients:doctor.emergency?.maxPatients|| "",
    telehealth: doctor.emergency?.telehealth ?? false,
  });

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addQual = () =>
    setQualifications(q => [...q, { id: uid(), degree: "", institution: "", year: "", country: "" }]);
  const updateQual = (id, key, val) =>
    setQualifications(q => q.map(x => x.id === id ? { ...x, [key]: val } : x));
  const removeQual = id =>
    setQualifications(q => q.filter(x => x.id !== id));

  const addExp = () =>
    setExperience(e => [...e, { id: uid(), role: "", hospital: "", from: "", to: "", current: false }]);
  const updateExp = (id, key, val) =>
    setExperience(e => e.map(x => x.id === id ? { ...x, [key]: val } : x));
  const removeExp = id =>
    setExperience(e => e.filter(x => x.id !== id));

  const addCert = () =>
    setCertifications(c => [...c, { id: uid(), name: "", issuingBody: "", issueDate: "", expiryDate: "" }]);
  const updateCert = (id, key, val) =>
    setCertifications(c => c.map(x => x.id === id ? { ...x, [key]: val } : x));
  const removeCert = id =>
    setCertifications(c => c.filter(x => x.id !== id));

  const addPub = () =>
    setPublications(p => [...p, { id: uid(), title: "", journal: "", year: "" }]);
  const updatePub = (id, key, val) =>
    setPublications(p => p.map(x => x.id === id ? { ...x, [key]: val } : x));
  const removePub = id =>
    setPublications(p => p.filter(x => x.id !== id));

  const toggleDay = idx =>
    setAvailability(a => a.map((d, i) => i === idx ? { ...d, available: !d.available } : d));
  const updateDay = (idx, key, val) =>
    setAvailability(a => a.map((d, i) => i === idx ? { ...d, [key]: val } : d));

  const handleSave = () => {
    // collect all state → would send to API
    console.log({ basic, professional, qualifications, experience, certifications, languages, expertise, publications, availability, emergency, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = `${basic.firstName?.[0] || ""}${basic.lastName?.[0] || ""}` || "DR";

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dp-page">

      {/* ── top hero ── */}
      <div className="dp-hero">
        <div className="dp-avatar-wrap">
          <div className="dp-avatar">
            {avatar
              ? <img src={avatar} alt="Profile" />
              : <span>{initials}</span>
            }
          </div>
          <label className="dp-avatar-edit" title="Change photo">
            <i className="ri-camera-line" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>
        </div>
        <div className="dp-hero-info">
          <h1>
            {basic.title} {basic.firstName || "First Name"} {basic.lastName || "Last Name"}
          </h1>
          <p className="dp-hero-specialty">
            {professional.specialty || "Specialty not set"}
            {professional.subSpecialty ? ` · ${professional.subSpecialty}` : ""}
          </p>
          <p className="dp-hero-hospital">
            {professional.currentHospital || "Hospital / Clinic not set"}
            {professional.department ? ` — ${professional.department}` : ""}
          </p>
          <div className="dp-hero-tags">
            {professional.licenseNumber && (
              <span className="dp-badge">Lic: {professional.licenseNumber}</span>
            )}
            {professional.yearsExperience && (
              <span className="dp-badge">{professional.yearsExperience} yrs exp.</span>
            )}
            {emergency.telehealth && (
              <span className="dp-badge dp-badge-green">Telehealth</span>
            )}
            {emergency.available && (
              <span className="dp-badge dp-badge-red">Emergency Available</span>
            )}
          </div>
        </div>
        <button className="dp-save-btn" onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </div>

      <div className="dp-body">

        {/* ══ 1. PERSONAL INFO ══════════════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="👤" title="Personal Information" />
          <div className="dp-grid-3">
            <Field label="Title">
              <select value={basic.title} onChange={e => setBasic({ ...basic, title: e.target.value })}>
                {["Dr.","Prof.","Mr.","Ms.","Mrs."].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="First Name">
              <input value={basic.firstName} placeholder="John"
                onChange={e => setBasic({ ...basic, firstName: e.target.value })} />
            </Field>
            <Field label="Last Name">
              <input value={basic.lastName} placeholder="Silva"
                onChange={e => setBasic({ ...basic, lastName: e.target.value })} />
            </Field>
            <Field label="Gender">
              <select value={basic.gender} onChange={e => setBasic({ ...basic, gender: e.target.value })}>
                <option value="">Select</option>
                {["Male","Female","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={basic.dob}
                onChange={e => setBasic({ ...basic, dob: e.target.value })} />
            </Field>
            <Field label="Contact Number">
              <input value={basic.phone} placeholder="+94 77 123 4567"
                onChange={e => setBasic({ ...basic, phone: e.target.value })} />
            </Field>
            <Field label="Email Address">
              <input type="email" value={basic.email} placeholder="doctor@hospital.lk"
                onChange={e => setBasic({ ...basic, email: e.target.value })} />
            </Field>
          </div>
          <Field label="Professional Bio">
            <textarea rows={4} value={basic.bio}
              placeholder="Brief description about your practice philosophy, approach to patient care, and what patients can expect..."
              onChange={e => setBasic({ ...basic, bio: e.target.value })} />
          </Field>
        </section>

        {/* ══ 2. PROFESSIONAL DETAILS ═══════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="🏥" title="Professional Details" />
          <div className="dp-grid-3">
            <Field label="Specialty">
              <select value={professional.specialty}
                onChange={e => setProfessional({ ...professional, specialty: e.target.value })}>
                <option value="">Select specialty</option>
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Sub-Specialty">
              <input value={professional.subSpecialty} placeholder="e.g. Pediatric Cardiology"
                onChange={e => setProfessional({ ...professional, subSpecialty: e.target.value })} />
            </Field>
            <Field label="Years of Experience">
              <input type="number" min="0" value={professional.yearsExperience} placeholder="e.g. 12"
                onChange={e => setProfessional({ ...professional, yearsExperience: e.target.value })} />
            </Field>
            <Field label="Medical License No.">
              <input value={professional.licenseNumber} placeholder="LIC-XXXXX"
                onChange={e => setProfessional({ ...professional, licenseNumber: e.target.value })} />
            </Field>
            <Field label="License Expiry Date">
              <input type="date" value={professional.licenseExpiry}
                onChange={e => setProfessional({ ...professional, licenseExpiry: e.target.value })} />
            </Field>
            <Field label="SLMC Registration No.">
              <input value={professional.slmcNumber} placeholder="SLMC-XXXXX"
                onChange={e => setProfessional({ ...professional, slmcNumber: e.target.value })} />
            </Field>
            <Field label="Current Hospital / Clinic">
              <input value={professional.currentHospital} placeholder="e.g. National Hospital Colombo"
                onChange={e => setProfessional({ ...professional, currentHospital: e.target.value })} />
            </Field>
            <Field label="Department">
              <input value={professional.department} placeholder="e.g. Pediatrics"
                onChange={e => setProfessional({ ...professional, department: e.target.value })} />
            </Field>
            <Field label="Consultation Fee (LKR)">
              <input type="number" min="0" value={professional.consultationFee} placeholder="e.g. 3000"
                onChange={e => setProfessional({ ...professional, consultationFee: e.target.value })} />
            </Field>
          </div>
        </section>

        {/* ══ 3. QUALIFICATIONS ═════════════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="🎓" title="Academic Qualifications" />
          <p className="dp-hint">Add your degrees — MBBS, MD, MS, Fellowship, etc.</p>

          {qualifications.map((q, idx) => (
            <div key={q.id} className="dp-entry-row">
              <div className="dp-entry-number">{idx + 1}</div>
              <div className="dp-entry-fields dp-grid-2">
                <Field label="Degree / Qualification">
                  <input value={q.degree} placeholder="e.g. MBBS, MD, MS, Fellowship"
                    onChange={e => updateQual(q.id, "degree", e.target.value)} />
                </Field>
                <Field label="Institution / University">
                  <input value={q.institution} placeholder="e.g. University of Colombo"
                    onChange={e => updateQual(q.id, "institution", e.target.value)} />
                </Field>
                <Field label="Year of Completion">
                  <input type="number" min="1950" max="2099" value={q.year} placeholder="e.g. 2010"
                    onChange={e => updateQual(q.id, "year", e.target.value)} />
                </Field>
                <Field label="Country">
                  <input value={q.country} placeholder="e.g. Sri Lanka"
                    onChange={e => updateQual(q.id, "country", e.target.value)} />
                </Field>
              </div>
              <button className="dp-remove-btn" onClick={() => removeQual(q.id)} title="Remove">×</button>
            </div>
          ))}

          <button className="dp-add-btn" onClick={addQual}>
            + Add Qualification
          </button>
        </section>

        {/* ══ 4. WORK EXPERIENCE ════════════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="💼" title="Work Experience" />
          <p className="dp-hint">List your hospital roles, residencies, fellowships, and past positions.</p>

          {experience.map((e, idx) => (
            <div key={e.id} className="dp-entry-row">
              <div className="dp-entry-number">{idx + 1}</div>
              <div className="dp-entry-fields">
                <div className="dp-grid-2">
                  <Field label="Role / Position">
                    <input value={e.role} placeholder="e.g. Consultant Pediatrician"
                      onChange={ev => updateExp(e.id, "role", ev.target.value)} />
                  </Field>
                  <Field label="Hospital / Institution">
                    <input value={e.hospital} placeholder="e.g. Lady Ridgeway Hospital"
                      onChange={ev => updateExp(e.id, "hospital", ev.target.value)} />
                  </Field>
                  <Field label="From">
                    <input type="month" value={e.from}
                      onChange={ev => updateExp(e.id, "from", ev.target.value)} />
                  </Field>
                  <Field label="To">
                    <input type="month" value={e.to} disabled={e.current}
                      onChange={ev => updateExp(e.id, "to", ev.target.value)} />
                  </Field>
                </div>
                <label className="dp-check-label">
                  <input type="checkbox" checked={e.current}
                    onChange={ev => updateExp(e.id, "current", ev.target.checked)} />
                  Currently working here
                </label>
              </div>
              <button className="dp-remove-btn" onClick={() => removeExp(e.id)} title="Remove">×</button>
            </div>
          ))}

          <button className="dp-add-btn" onClick={addExp}>
            + Add Experience
          </button>
        </section>

        {/* ══ 5. CERTIFICATIONS & BOARD MEMBERSHIPS ════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="📜" title="Certifications & Board Memberships" />
          <p className="dp-hint">Include board certifications, professional memberships, and specialist registrations.</p>

          {certifications.map((c, idx) => (
            <div key={c.id} className="dp-entry-row">
              <div className="dp-entry-number">{idx + 1}</div>
              <div className="dp-entry-fields dp-grid-2">
                <Field label="Certification / Membership Name">
                  <input value={c.name} placeholder="e.g. Board Certified Pediatrician"
                    onChange={e => updateCert(c.id, "name", e.target.value)} />
                </Field>
                <Field label="Issuing Body / Organization">
                  <input value={c.issuingBody} placeholder="e.g. Sri Lanka College of Pediatricians"
                    onChange={e => updateCert(c.id, "issuingBody", e.target.value)} />
                </Field>
                <Field label="Issue Date">
                  <input type="date" value={c.issueDate}
                    onChange={e => updateCert(c.id, "issueDate", e.target.value)} />
                </Field>
                <Field label="Expiry Date (if applicable)">
                  <input type="date" value={c.expiryDate}
                    onChange={e => updateCert(c.id, "expiryDate", e.target.value)} />
                </Field>
              </div>
              <button className="dp-remove-btn" onClick={() => removeCert(c.id)} title="Remove">×</button>
            </div>
          ))}

          <button className="dp-add-btn" onClick={addCert}>
            + Add Certification
          </button>
        </section>

        {/* ══ 6. AREAS OF EXPERTISE ════════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="🔬" title="Areas of Expertise" />
          <p className="dp-hint">Add conditions treated, procedures performed, or clinical focus areas.</p>
          <TagInput
            tags={expertise}
            onAdd={t => setExpertise(x => [...x, t])}
            onRemove={i => setExpertise(x => x.filter((_, j) => j !== i))}
            placeholder="e.g. Congenital Heart Disease, press Enter"
          />
        </section>

        {/* ══ 7. LANGUAGES ═════════════════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="🌐" title="Languages Spoken" />
          <p className="dp-hint">Languages you can consult in with patients.</p>
          <TagInput
            tags={languages}
            onAdd={t => setLanguages(l => [...l, t])}
            onRemove={i => setLanguages(l => l.filter((_, j) => j !== i))}
            placeholder="e.g. Sinhala, Tamil, English — press Enter"
          />
        </section>

        {/* ══ 8. PUBLICATIONS & RESEARCH ═══════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="📚" title="Publications & Research" />
          <p className="dp-hint">List peer-reviewed papers, journal articles, or notable research contributions.</p>

          {publications.map((p, idx) => (
            <div key={p.id} className="dp-entry-row">
              <div className="dp-entry-number">{idx + 1}</div>
              <div className="dp-entry-fields dp-grid-2">
                <Field label="Title" >
                  <input value={p.title} placeholder="Publication title"
                    style={{ gridColumn: "1 / -1" }}
                    onChange={e => updatePub(p.id, "title", e.target.value)} />
                </Field>
                <Field label="Journal / Conference">
                  <input value={p.journal} placeholder="e.g. The Lancet"
                    onChange={e => updatePub(p.id, "journal", e.target.value)} />
                </Field>
                <Field label="Year">
                  <input type="number" min="1950" max="2099" value={p.year} placeholder="e.g. 2022"
                    onChange={e => updatePub(p.id, "year", e.target.value)} />
                </Field>
              </div>
              <button className="dp-remove-btn" onClick={() => removePub(p.id)} title="Remove">×</button>
            </div>
          ))}

          <button className="dp-add-btn" onClick={addPub}>
            + Add Publication
          </button>
        </section>

        {/* ══ 9. AVAILABILITY ══════════════════════════════════════════════ */}
        <section className="dp-card">
          <SectionHeader icon="📅" title="Consultation Availability" />
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
              <input type="checkbox" checked={emergency.available}
                onChange={e => setEmergency({ ...emergency, available: e.target.checked })} />
              Available for emergency consultations
            </label>
            <label className="dp-check-label">
              <input type="checkbox" checked={emergency.telehealth}
                onChange={e => setEmergency({ ...emergency, telehealth: e.target.checked })} />
              Offers telehealth / online consultations
            </label>
            <Field label="Max Patients per Day">
              <input type="number" min="1" value={emergency.maxPatients} placeholder="e.g. 30"
                onChange={e => setEmergency({ ...emergency, maxPatients: e.target.value })} />
            </Field>
          </div>
        </section>

      </div>

      {/* ── sticky footer save ── */}
      <div className="dp-footer">
        <p className="dp-footer-note">Changes are saved to your profile and visible to clinic administrators.</p>
        <button className="dp-save-btn" onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </div>

    </div>
  );
}
