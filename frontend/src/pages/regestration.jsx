import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import style from '../assets/styleSheets/Registration.module.css';

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmCorrect, setConfirmCorrect] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');


  const [formData, setFormData] = useState({
    childName: '',
    childDOB: '',
    nationality: '',
    childNumber: '',
    language: '',
    motherName: '',
    motherDOB: '',
    motherEmail: '',
    motherPhone: '',
    birthLocation: '',
    birthHospital: '',
    deliveryType: '',
    surgery: '',
    birthWeight: '',
    birthLength: '',
    headCircumference: '',
    personnelType: '',
    personnelName: '',
    livingAddress: '',
    registrationDate: new Date().toISOString().split('T')[0]
  });

  // account credentials entered by user
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateRegistrationNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `CHDR-${timestamp}-${random}`;
  };

  // make reqired fileds in reg form
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return agreeTerms;

      case 1:
        return (
          formData.childName &&
          formData.childDOB &&
          formData.nationality &&
          formData.childNumber &&
          formData.language
        );

      case 2:
        return (
          formData.motherName &&
          formData.motherDOB &&
          formData.motherEmail &&
          formData.motherPhone
        );

      case 3:
        return (
          formData.birthLocation &&
          formData.birthHospital &&
          formData.deliveryType &&
          formData.surgery &&
          formData.birthWeight &&
          formData.birthLength &&
          formData.headCircumference
        );

      case 4:
        return formData.personnelType && formData.personnelName;

      case 5:
        return formData.livingAddress;

      case 6:
        // account credentials step: username/password validations
        return (
          username && username.length >= 4 &&
          /^[a-zA-Z0-9]+$/.test(username) &&
          password &&
          confirmPassword &&
          password === confirmPassword &&
          password.length >= 8
        );

      case 7:
        return confirmCorrect;

      default:
        return false;
    }
  };

  const nextSection = () => {
    if (!isStepValid()) {
      setPopupMessage('Please fill all required fields before continuing.');
      setShowPopup(true);
      return;
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      updateProgressBar(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateProgressBar(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateProgressBar = (step) => {
    const progressPercentage = (step / 7) * 100;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
  };

  const submitForm = async () => {
    if (!confirmCorrect) return;

    const regNumber = generateRegistrationNumber();
    const payload = {
      registrationNumber: regNumber,
      username,
      password,
      ...formData,
      status: "PENDING"
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/pending_registration", { // change the fetch link to the databse
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Submission failed");
      }

      setRegistrationNumber(regNumber);
      setIsSubmitted(true);

      setPopupMessage("Registration Successful! Your account details have been sent securely.");
      setShowPopup(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      setPopupMessage(error.message);
      setShowPopup(true);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setIsSubmitted(false);
    setAgreeTerms(false);
    setConfirmCorrect(false);
    setRegistrationNumber('');
    setFormData({
      childName: '',
      childDOB: '',
      nationality: '',
      childNumber: '',
      language: '',
      motherName: '',
      motherDOB: '',
      motherEmail: '',
      motherPhone: '',
      birthLocation: '',
      birthHospital: '',
      deliveryType: '',
      surgery: '',
      birthWeight: '',
      birthLength: '',
      headCircumference: '',
      personnelType: '',
      personnelName: '',
      livingAddress: '',
      registrationDate: new Date().toISOString().split('T')[0]
    });
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    updateProgressBar(0);
  };

  const downloadReviewPDF = () => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Ensure we have an ID to show
    const displayID = registrationNumber || "PENDING-REGISTRATION";

    // --- Header Section ---
    doc.setFontSize(22);
    doc.setTextColor(102, 126, 234); // Matches your CSS #667eea
    doc.text('Bambinooo Registry', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Child Health & Development Registry Official Record', 14, 27);

    // Registration Number Badge (Top Right)
    doc.setFillColor(248, 250, 252);
    doc.rect(pageWidth - 95, 12, 81, 18, 'F');
    doc.setDrawColor(102, 126, 234);
    doc.rect(pageWidth - 95, 12, 81, 18, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('REGISTRATION NUMBER', pageWidth - 90, 18);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(displayID, pageWidth - 90, 25);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 32, pageWidth - 14, 32);

    // --- Data Preparation (Including ALL Form Data) ---
    const tableData = [
      // Section 1: Child Info
      [{ content: '1. CHILD INFORMATION', colSpan: 2, styles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' } }],
      ['Full Name', formData.childName],
      ['Date of Birth', formData.childDOB],
      ['Nationality', formData.nationality],
      ['Family Position', `${formData.childNumber} Baby`],
      ['Preferred Language', formData.language],

      // Section 2: Mother Info
      [{ content: '2. MOTHER DETAILS', colSpan: 2, styles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' } }],
      ['Mother Name', formData.motherName],
      ['Mother DOB', formData.motherDOB],
      ['Contact Phone', formData.motherPhone],
      ['Email Address', formData.motherEmail],

      // Section 3: Birth & Medical Data
      [{ content: '3. BIRTH & MEDICAL DATA', colSpan: 2, styles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' } }],
      ['Hospital', formData.birthHospital],
      ['Birth Location', formData.birthLocation],
      ['Delivery Type', formData.deliveryType],
      ['Surgery Performed', formData.surgery],
      ['Birth Weight', `${formData.birthWeight} kg`],
      ['Birth Length', `${formData.birthLength} cm`],
      ['Head Circumference', `${formData.headCircumference} cm`],

      // Section 4: Assigned Personnel
      [{ content: '4. HEALTHCARE PERSONNEL', colSpan: 2, styles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' } }],
      ['Provider Type', formData.personnelType],
      ['Provider Name', formData.personnelName],

      // Section 5: Account & Logistics
      [{ content: '5. REGISTRATION LOGS', colSpan: 2, styles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' } }],
      ['Account Username', username],
      ['Home Address', formData.livingAddress],
      ['Registration Date', formData.registrationDate],
    ];

    // --- Execute Table Generation ---
    // Use autoTable(doc, ...) instead of doc.autoTable to avoid the "not a function" error
    autoTable(doc, {
      startY: 40,
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });

    // --- Footer ---
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Official Document - Generated on: ${new Date().toLocaleString()}`, 14, finalY + 15);
    doc.text('This is a secure system record from the Bambinooo Registry.', 14, finalY + 20);

    doc.save(`Bambinooo_Record_${displayID}.pdf`);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    setPopupMessage("Error generating PDF. Please ensure all data is filled.");
    setShowPopup(true);
  }
};

  return (
    <div className={style.container}>
      {!isSubmitted && (
        <>
          <div className={style.logoSection}>
            <div className={style.logoText}>Welcome to Bambinooo</div>
            <div className={style.subtitle}>Child Health & Development Registry</div>
          </div>

          <div className={style.progressBar}>
            <div className={style.steps}>
              <div className={style.progressLine}>
                <div className={style.progressLineFill} id="progressFill"></div>
              </div>
              <div className={`${style.step} ${currentStep === 0 ? style.active : ''} ${currentStep > 0 ? style.completed : ''}`}>
                <div className={style.stepNumber}>1</div>
                <div className={style.stepLabel}>Agreement</div>
              </div>
              <div className={`${style.step} ${currentStep === 1 ? style.active : ''} ${currentStep > 1 ? style.completed : ''}`}>
                <div className={style.stepNumber}>2</div>
                <div className={style.stepLabel}>Child Info</div>
              </div>
              <div className={`${style.step} ${currentStep === 2 ? style.active : ''} ${currentStep > 2 ? style.completed : ''}`}>
                <div className={style.stepNumber}>3</div>
                <div className={style.stepLabel}>Mother Info</div>
              </div>
              <div className={`${style.step} ${currentStep === 3 ? style.active : ''} ${currentStep > 3 ? style.completed : ''}`}>
                <div className={style.stepNumber}>4</div>
                <div className={style.stepLabel}>Birth Details</div>
              </div>
              <div className={`${style.step} ${currentStep === 4 ? style.active : ''} ${currentStep > 4 ? style.completed : ''}`}>
                <div className={style.stepNumber}>5</div>
                <div className={style.stepLabel}>Medical</div>
              </div>
              <div className={`${style.step} ${currentStep === 5 ? style.active : ''} ${currentStep > 5 ? style.completed : ''}`}>
                <div className={style.stepNumber}>6</div>
                <div className={style.stepLabel}>Address</div>
              </div>
              <div className={`${style.step} ${currentStep === 6 ? style.active : ''} ${currentStep > 6 ? style.completed : ''}`}>
                <div className={style.stepNumber}>7</div>
                <div className={style.stepLabel}>Account</div>
              </div>
              <div className={`${style.step} ${currentStep === 7 ? style.active : ''}`}>
                <div className={style.stepNumber}>8</div>
                <div className={style.stepLabel}>Review</div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={style.card}>
        <div className={`${style.section} ${currentStep === 0 && !isSubmitted ? style.active : ''}`} id="section0">
          <h2 className={style.sectionTitle}>Terms & Conditions</h2>
          <p className={style.sectionDescription}>
            Please review and accept our terms before proceeding
          </p>

          <div className={style.checkboxContainer}>
            <div className={style.termsTitle}>Registration Agreement</div>
            <ul className={style.termsList}>
              <li>I confirm that all information provided is accurate and complete</li>
              <li>I consent to the collection and processing of this medical data</li>
              <li>I understand this information will be shared with assigned medical personnel</li>
              <li>I agree to notify the hospital of any changes to the provided information</li>
              <li>I consent to the use of this data for medical treatment and record keeping</li>
            </ul>

            <div className={style.checkboxWrapper}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="agreeTerms">
                I have read and agree to all terms and conditions
              </label>
            </div>
          </div>

          <div className={style.btnGroup}>
            <button
              className={`${style.btn} ${style.btnPrimary}`}
              disabled={!agreeTerms}
              onClick={nextSection}
            >
              Continue to Registration
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 1 && !isSubmitted ? style.active : ''}`} id="section1">
          <h2 className={style.sectionTitle}>Child Information</h2>
          <p className={style.sectionDescription}>
            Please provide basic information about the child
          </p>

          <div className={style.formGroup}>
            <label>Child's Full Name <span className={style.required}>*</span></label>
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className={style.formRow}>
            <div className={style.formGroup}>
              <label>Date of Birth <span className={style.required}>*</span></label>
              <input
                type="date"
                name="childDOB"
                value={formData.childDOB}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={style.formGroup}>
              <label>Nationality <span className={style.required}>*</span></label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                placeholder="e.g., Sri Lankan"
                required
              />
            </div>
          </div>

          <div className={style.formRow}>
            <div className={style.formGroup}>
              <label>Child Number in Family <span className={style.required}>*</span></label>
              <select
                name="childNumber"
                value={formData.childNumber}
                onChange={handleInputChange}
                required
              >
                <option value="">Select position in family</option>
                <option value="1">1st Baby</option>
                <option value="2">2nd Baby</option>
                <option value="3">3rd Baby</option>
                <option value="4">4th Baby</option>
                <option value="5">5th Baby</option>
                <option value="6">6th Baby or More</option>
              </select>
            </div>
            <div className={style.formGroup}>
              <label>Preferred Language <span className={style.required}>*</span></label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
              >
                <option value="">Select language</option>
                <option value="Sinhala">Sinhala</option>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back
            </button>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={nextSection}>
              Continue
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 2 && !isSubmitted ? style.active : ''}`} id="section2">
          <h2 className={style.sectionTitle}>Mother Information</h2>
          <p className={style.sectionDescription}>
            Please provide information about the mother
          </p>

          <div className={style.formGroup}>
            <label>Mother's Full Name <span className={style.required}>*</span></label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Mother's Date of Birth <span className={style.required}>*</span></label>
            <input
              type="date"
              name="motherDOB"
              value={formData.motherDOB}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Email Address <span className={style.required}>*</span></label>
            <input
              type="email"
              name="motherEmail"
              value={formData.motherEmail}
              onChange={handleInputChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Phone Number <span className={style.required}>*</span></label>
            <input
              type="tel"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleInputChange}
              placeholder="07XXXXXXXX"
              pattern="[0-9]{10}"
              required
            />
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back
            </button>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={nextSection}>
              Continue
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 3 && !isSubmitted ? style.active : ''}`} id="section3">
          <h2 className={style.sectionTitle}>Birth Details</h2>
          <p className={style.sectionDescription}>
            Please provide details about the birth
          </p>

          <div className={style.formRow}>
            <div className={style.formGroup}>
              <label>Birth Location <span className={style.required}>*</span></label>
              <input
                type="text"
                name="birthLocation"
                value={formData.birthLocation}
                onChange={handleInputChange}
                placeholder="City, Country"
                required
              />
            </div>
            <div className={style.formGroup}>
              <label>Birth Hospital/Home <span className={style.required}>*</span></label>
              <input
                type="text"
                name="birthHospital"
                value={formData.birthHospital}
                onChange={handleInputChange}
                placeholder="Hospital name"
                required
              />
            </div>
          </div>

          <div className={style.formGroup}>
            <label>Type of Delivery <span className={style.required}>*</span></label>
            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select delivery type</option>
              <option value="Normal Vaginal">Normal Vaginal Delivery</option>
              <option value="Cesarean">Cesarean Section (C-Section)</option>
              <option value="Assisted Vaginal">Assisted Vaginal (Forceps/Vacuum)</option>
              <option value="Water Birth">Water Birth</option>
            </select>
          </div>

          <div className={style.formGroup}>
            <label>Was surgery performed during delivery? <span className={style.required}>*</span></label>
            <div className={style.radioGroup}>
              <div className={style.radioOption}>
                <input
                  type="radio"
                  id="surgeryYes"
                  name="surgery"
                  value="Yes"
                  checked={formData.surgery === 'Yes'}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="surgeryYes">Yes</label>
              </div>
              <div className={style.radioOption}>
                <input
                  type="radio"
                  id="surgeryNo"
                  name="surgery"
                  value="No"
                  checked={formData.surgery === 'No'}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="surgeryNo">No</label>
              </div>
            </div>
          </div>

          <div className={style.formRow}>
            <div className={style.formGroup}>
              <label>Birth Weight (kg) <span className={style.required}>*</span></label>
              <input
                type="number"
                name="birthWeight"
                value={formData.birthWeight}
                onChange={handleInputChange}
                step="0.01"
                placeholder="e.g., 3.2"
                required
              />
            </div>
            <div className={style.formGroup}>
              <label>Birth Length (cm) <span className={style.required}>*</span></label>
              <input
                type="number"
                name="birthLength"
                value={formData.birthLength}
                onChange={handleInputChange}
                step="0.1"
                placeholder="e.g., 50.5"
                required
              />
            </div>
          </div>

          <div className={style.formGroup}>
            <label>Head Circumference (cm) <span className={style.required}>*</span></label>
            <input
              type="number"
              name="headCircumference"
              value={formData.headCircumference}
              onChange={handleInputChange}
              step="0.1"
              placeholder="e.g., 35.0"
              required
            />
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back
            </button>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={nextSection}>
              Continue
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 4 && !isSubmitted ? style.active : ''}`} id="section4">
          <h2 className={style.sectionTitle}>Medical Personnel</h2>
          <p className={style.sectionDescription}>
            Who will be the assigned healthcare provider?
          </p>

          <div className={style.formGroup}>
            <label>Personnel Type <span className={style.required}>*</span></label>
            <select
              name="personnelType"
              value={formData.personnelType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select healthcare provider type</option>
              <option value="Doctor">Doctor</option>
              <option value="Midwife">Midwife</option>
              <option value="Nurse">Nurse</option>
            </select>
          </div>

          <div className={style.formGroup}>
            <label>Personnel Name <span className={style.required}>*</span></label>
            <input
              type="text"
              name="personnelName"
              value={formData.personnelName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back
            </button>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={nextSection}>
              Continue
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 5 && !isSubmitted ? style.active : ''}`} id="section5">
          <h2 className={style.sectionTitle}>Contact Information</h2>
          <p className={style.sectionDescription}>Where can we reach you?</p>

          <div className={style.formGroup}>
            <label>Patient Living Address <span className={style.required}>*</span></label>
            <textarea
              name="livingAddress"
              value={formData.livingAddress}
              onChange={handleInputChange}
              placeholder="Street address, City, State, Postal Code"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Registration Date <span className={style.required}>*</span></label>
            <input
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              readOnly
            />
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back
            </button>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={nextSection}>
              Continue
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 6 && !isSubmitted ? style.active : ''}`} id="section6">
          <h2 className={style.sectionTitle}>Account Credentials</h2>
          <p className={style.sectionDescription}>
            Choose a username and password you will use to log in later.
          </p>

          <div className={style.formGroup}>
            <label>Username <span className={style.required}>*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter desired username"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Password <span className={style.required}>*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Confirm Password <span className={style.required}>*</span></label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className={style.validationMessage}>
            {username && username.length < 4 && (
              <p className={style.error}>Username must be at least 4 characters</p>
            )}
            {username && !/^[a-zA-Z0-9]+$/.test(username) && (
              <p className={style.error}>Username must be alphanumeric only</p>
            )}
            {password && password.length < 8 && (
              <p className={style.error}>Password must be at least 8 characters</p>
            )}
            {password && confirmPassword && password !== confirmPassword && (
              <p className={style.error}>Passwords do not match</p>
            )}
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back
            </button>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={nextSection}>
              Continue
            </button>
          </div>
        </div>

        <div className={`${style.section} ${currentStep === 7 && !isSubmitted ? style.active : ''}`} id="section7">
          <h2 className={style.sectionTitle}>Review Your Information</h2>
          <p className={style.sectionDescription}>
            Please review all the information carefully before submitting
          </p>

          <div className={style.reviewContainer}>
            <div className={style.reviewSection}>
              <h3 className={style.reviewSectionTitle}>Child Information</h3>
              <div className={style.reviewGrid}>
                <div className={style.reviewItem}>
                  <strong>Child's Full Name:</strong> {formData.childName}
                </div>
                <div className={style.reviewItem}>
                  <strong>Date of Birth:</strong> {formData.childDOB}
                </div>
                <div className={style.reviewItem}>
                  <strong>Nationality:</strong> {formData.nationality}
                </div>
                <div className={style.reviewItem}>
                  <strong>Family Position:</strong> {formData.childNumber}
                </div>
                <div className={style.reviewItem}>
                  <strong>Preferred Language:</strong> {formData.language}
                </div>
              </div>
            </div>

            <div className={style.reviewSection}>
              <h3 className={style.reviewSectionTitle}>Mother Information</h3>
              <div className={style.reviewGrid}>
                <div className={style.reviewItem}>
                  <strong>Mother's Name:</strong> {formData.motherName}
                </div>
                <div className={style.reviewItem}>
                  <strong>Date of Birth:</strong> {formData.motherDOB}
                </div>
                <div className={style.reviewItem}>
                  <strong>Email:</strong> {formData.motherEmail}
                </div>
                <div className={style.reviewItem}>
                  <strong>Phone Number:</strong> {formData.motherPhone}
                </div>
              </div>
            </div>

            <div className={style.reviewSection}>
              <h3 className={style.reviewSectionTitle}>Birth Details</h3>
              <div className={style.reviewGrid}>
                <div className={style.reviewItem}>
                  <strong>Birth Location:</strong> {formData.birthLocation}
                </div>
                <div className={style.reviewItem}>
                  <strong>Birth Hospital/Home:</strong> {formData.birthHospital}
                </div>
                <div className={style.reviewItem}>
                  <strong>Delivery Type:</strong> {formData.deliveryType}
                </div>
                <div className={style.reviewItem}>
                  <strong>Surgery:</strong> {formData.surgery}
                </div>
                <div className={style.reviewItem}>
                  <strong>Birth Weight:</strong> {formData.birthWeight} kg
                </div>
                <div className={style.reviewItem}>
                  <strong>Birth Length:</strong> {formData.birthLength} cm
                </div>
                <div className={style.reviewItem}>
                  <strong>Head Circumference:</strong> {formData.headCircumference} cm
                </div>
              </div>
            </div>

            <div className={style.reviewSection}>
              <h3 className={style.reviewSectionTitle}>Medical Personnel</h3>
              <div className={style.reviewGrid}>
                <div className={style.reviewItem}>
                  <strong>Personnel Type:</strong> {formData.personnelType}
                </div>
                <div className={style.reviewItem}>
                  <strong>Personnel Name:</strong> {formData.personnelName}
                </div>
              </div>
            </div>

            <div className={style.reviewSection}>
              <h3 className={style.reviewSectionTitle}>Contact Information</h3>
              <div className={style.reviewGrid}>
                <div className={style.reviewItem}>
                  <strong>Living Address:</strong> {formData.livingAddress}
                </div>
                <div className={style.reviewItem}>
                  <strong>Registration Date:</strong> {formData.registrationDate}
                </div>
              </div>
            </div>
          </div>

          <div className={style.checkboxContainer} style={{ marginTop: '24px' }}>
            <div className={style.termsTitle} style={{ color: '#e53e3e' }}>
              ⚠️ Important Notice
            </div>
            <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
              Once you submit this registration, <strong>you will not be able to edit any information</strong>.
              Please ensure all details are correct before proceeding.
            </p>

            <div className={style.checkboxWrapper}>
              <input
                type="checkbox"
                id="confirmCorrect"
                checked={confirmCorrect}
                onChange={(e) => setConfirmCorrect(e.target.checked)}
              />
              <label htmlFor="confirmCorrect">
                I confirm that all the information provided is correct and I understand that I cannot edit it after submission
              </label>
            </div>
          </div>

          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnSecondary}`} onClick={prevSection}>
              Back to Edit
            </button>
            <button
              className={`${style.btn} ${style.btnPrimary}`}
              disabled={!confirmCorrect}
              onClick={submitForm}
            >
              Submit Registration
            </button>
          </div>
        </div>

        <div className={`${style.successScreen} ${isSubmitted ? style.active : ''}`} id="successScreen">
          <div className={style.successIcon}>
            <svg viewBox="0 0 52 52">
              <polyline points="14 27 22 35 38 19" />
            </svg>
          </div>
          <h2 className={style.successTitle}>Registration Submitted!</h2>
          <p className={style.successMessage}>
            Your registration form has been successfully submitted and processed.
          </p>

          <div className={style.registrationDetails}>
            <div className={style.regNumberContainer}>
              <p className={style.regNumberLabel}>Your Unique Registration Number:</p>
              <p className={style.regNumber}>{registrationNumber}</p>
            </div>
            <p className={style.regNote}>
              Please save this registration number for your records. You will need it for future
              reference and accessing your child's health records in the CHDR system.
            </p>
          </div>

          <p className={style.downloadNote}>
            Please download your registration details as a PDF before refreshing this page.
          </p>
          <div className={style.btnGroup}>
            <button className={`${style.btn} ${style.btnPrimary}`} onClick={downloadReviewPDF}>
              Download PDF
            </button>
          </div>

          <button
            className={`${style.btn} ${style.btnPrimary}`}
            style={{ marginTop: '24px' }}
            onClick={resetForm}
          >
            Register Another Child
          </button>
        </div>
      </div>
      {
        showPopup && (
          <div className={style.popupOverlay}>
            <div className={style.popupBox}>
              <h3 className={style.popupTitle}>⚠ Required Fields</h3>
              <p className={style.popupMessage}>{popupMessage}</p>
              <button
                className={`${style.btn} ${style.btnPrimary}`}
                onClick={() => setShowPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default Registration;