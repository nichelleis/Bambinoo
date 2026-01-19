import { useEffect, useState } from "react";

const CHDRView = ({ selectedChild }) => {
  const [chdrData, setChdrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChild) {
      setChdrData(null);
      return;
    }

    setLoading(true);
    setError("");

    fetch(`http://127.0.0.1:5000/api/doctor/children/${selectedChild.id}/chdr`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CHDR");
        return res.json();
      })
      .then((data) => {
        setChdrData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedChild]);

  const exportCHDR = () => {
    if (!chdrData) return;
    
    const dataStr = JSON.stringify(chdrData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CHDR_${chdrData.name}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // No patient selected state
  if (!selectedChild) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <svg
              style={{
                margin: '0 auto',
                height: '96px',
                width: '96px',
                color: '#d1d5db'
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            No Patient Selected
          </h3>
          <p style={{ color: '#6b7280' }}>
            Please search and select a patient to view their Child Health
            <br />
            Development Record (CHDR).
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderBottomColor: '#14b8a6',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#4b5563' }}>Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <p style={{ color: '#991b1b' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  // CHDR Display
  return (
    <div style={{
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(to right, #f0fdfa, #ecfeff)',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              backgroundColor: '#fce7f3',
              borderRadius: '50%',
              padding: '16px'
            }}>
              <svg
                style={{ height: '32px', width: '32px', color: '#db2777' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                {chdrData?.name}
              </h1>
              <p style={{
                color: '#4b5563',
                fontSize: '14px',
                marginTop: '4px'
              }}>
                Child Health Development Record (CHDR)
              </p>
            </div>
          </div>
          <button
            onClick={exportCHDR}
            style={{
              backgroundColor: '#14b8a6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg
              style={{ height: '20px', width: '20px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CHDR
          </button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#3b82f6' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Date of Birth</span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>3/15/2021</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {chdrData?.age} years, 10 months
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#ef4444' }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Blood Type</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {chdrData?.blood || "A+"}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#eab308' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Allergies</span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>2 recorded</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#22c55e' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Active Conditions</span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            {chdrData?.activeConditions?.length || 1}
          </p>
        </div>
      </div>

      {/* Allergies Alert */}
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <svg
            style={{
              height: '24px',
              width: '24px',
              color: '#dc2626',
              flexShrink: 0,
              marginTop: '2px'
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#991b1b',
              marginBottom: '8px'
            }}>
              Known Allergies
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '14px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                Peanuts
              </span>
              <span style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '14px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                Penicillin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Latest Growth Measurements */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#14b8a6' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Latest Growth Measurements
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#14b8a6' }}>
                {chdrData?.growth?.weight?.split(" ")[0] || "12.5"}
              </p>
              <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
                kg (Weight)
              </p>
            </div>
            <div style={{
              textAlign: 'center',
              borderLeft: '1px solid #e5e7eb',
              borderRight: '1px solid #e5e7eb'
            }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#14b8a6' }}>
                {chdrData?.growth?.height?.split(" ")[0] || "85"}
              </p>
              <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
                cm (Height)
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#14b8a6' }}>
                {chdrData?.growth?.head?.split(" ")[0] || "47"}
              </p>
              <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
                cm (Head)
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '16px'
          }}>
            Recorded on {chdrData?.growth?.recorded || "1/1/2024"}
          </p>
        </div>

        {/* Immunization Status */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#14b8a6' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Immunization Status
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px'
            }}>
              <span style={{ color: '#4b5563' }}>Total Immunizations</span>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>
                {chdrData?.immunizations?.length || 2}
              </span>
            </div>

            {(chdrData?.immunizations?.slice(0, 3) || [{name: 'MMR', status: 'completed'}, {name: 'DTaP', status: 'completed'}]).map((imm, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px'
                }}
              >
                <span style={{ fontSize: '14px', color: '#374151' }}>{imm.name}</span>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    backgroundColor: imm.status === 'completed' ? '#d1fae5' : '#fef3c7',
                    color: imm.status === 'completed' ? '#065f46' : '#92400e'
                  }}
                >
                  {imm.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Medical History */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#eab308' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Medical History
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(chdrData?.medicalHistory?.length > 0 ? chdrData.medicalHistory : [{condition: 'Eczema', status: 'active'}]).map((history, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#1f2937' }}>
                      {history.condition}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Diagnosed: 9/20/2022
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '9999px'
                  }}>
                    {history.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Medications */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <svg
              style={{ height: '20px', width: '20px', color: '#3b82f6' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Active Medications
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <p style={{ fontWeight: '500', color: '#1f2937' }}>Cetirizine</p>
                <span style={{
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '9999px'
                }}>
                  Long-term
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>5ml • Once daily</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CHDRView;