import React, { useState, useEffect } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    moh_id: "",
    role: "doctor",
    password: "",
    registration_number: "",
    child_name: "",
    child_dob: "",
    nationality: "",
    child_number: "",
    language: "",
    mother_name: "",
    mother_dob: "",
    mother_email: "",
    mother_phone: "",
    birth_location: "",
    birth_hospital: "",
    delivery_type: "",
    surgery: "",
    birth_weight: "",
    birth_length: "",
    head_circumference: "",
    personnel_type: "",
    personnel_name: "",
    living_address: "",
    registration_date: "",
    status: "pending",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/api/admin/users",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to load user data");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const exportToCSV = () => {
    const headers = "MOH_ID,Username,Email,Phone,Role\n";
    const rows = filteredUsers
      .map(
        (u) =>
          `${u.moh_id || u.MOH_ID || "N/A"},${u.username},${u.email},${u.phone || "N/A"},${u.role}`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_list.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingUser
      ? `https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/api/admin/users/${editingUser.id}`
      : "https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/api/admin/create-user";
    const method = editingUser ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error saving data");
      }
    } catch (err) {
      alert("Error saving data");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user: ${username}?`))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://stark-harbor-79359-9d7adf515fd1.herokuapp.com/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      } else {
        const data = await response.json();
        alert(data.message || "Deletion failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const filteredUsers = users.filter((user) => {
    const mohIdString = String(user.moh_id || user.MOH_ID || "").toLowerCase();
    const matchesSearch = mohIdString.includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "All" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isParent = editingUser
    ? editingUser.role?.toLowerCase() === "parent"
    : formData.role?.toLowerCase() === "parent";

  return (
    <div className="admin-content" style={{ padding: "20px" }}>
      <div style={headerContainerStyle}>
        <div>
          <h1 style={titleStyle}>User Management</h1>
          <p style={subtitleStyle}>
            Manage staff accounts and system permissions.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button style={exportBtnStyle} onClick={exportToCSV}>
            <span style={{ fontSize: "14px" }}>
              <i class="bi bi-download"></i>
            </span>{" "}
            Export CSV
          </button>
          <button
            style={createBtnStyle}
            onClick={() => {
              setEditingUser(null);
              setFormData({
                username: "",
                email: "",
                phone: "",
                moh_id: "",
                role: "doctor",
                password: "",
                registration_number: "",
                child_name: "",
                child_dob: "",
                nationality: "",
                child_number: "",
                language: "",
                mother_name: "",
                mother_dob: "",
                mother_email: "",
                mother_phone: "",
                birth_location: "",
                birth_hospital: "",
                delivery_type: "",
                surgery: "",
                birth_weight: "",
                birth_length: "",
                head_circumference: "",
                personnel_type: "",
                personnel_name: "",
                living_address: "",
                registration_date: "",
                status: "pending",
              });
              setShowModal(true);
            }}
          >
            + Add Staff
          </button>
        </div>
      </div>

      <div style={filterBarStyle}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={searchIconStyle}>
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            placeholder="Search by MOH ID "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={{ position: "relative", display: "inline-block" }}>
          <i
            className="bi bi-funnel"
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#64748b",
            }}
          ></i>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "10px 12px 10px 35px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "white",
              appearance: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="parent">Parent</option>
          </select>
        </div>
      </div>

      <div style={tableCardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={headerStyle}>MOH ID</th>
              <th style={headerStyle}>USERNAME</th>
              <th style={headerStyle}>EMAIL</th>
              <th style={headerStyle}>PHONE</th>
              <th style={headerStyle}>ROLE</th>
              <th style={headerStyle}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={tableRowStyle}>
                <td style={cellStyle}>{user.moh_id || user.MOH_ID || "N/A"}</td>
                <td style={{ ...cellStyle, fontWeight: "600" }}>
                  {user.username}
                </td>
                <td style={cellStyle}>{user.email}</td>
                <td style={cellStyle}>{user.phone || "N/A"}</td>
                <td style={cellStyle}>{user.role}</td>
                <td style={cellStyle}>
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        ...formData,
                        username: user.username,
                        email: user.email,
                        phone: user.phone || "",
                        moh_id: user.moh_id || user.MOH_ID || "",
                        role: user.role?.toLowerCase() || "doctor",
                        password: "",
                      });
                      setShowModal(true);
                    }}
                    style={actionBtnStyle}
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    style={{ ...actionBtnStyle, color: "#ef4444" }}
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div
            style={{
              ...modalContentStyle,
              width: isParent ? "800px" : "500px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>
              {editingUser
                ? `Edit ${isParent ? "Parent" : "Staff"} Account`
                : "Register New Account"}
            </h2>

            <form onSubmit={handleSaveUser}>
              {!isParent && (
                <>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Username</label>
                    <input
                      required
                      name="username"
                      style={modalInputStyle}
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Email</label>
                    <input
                      required
                      name="email"
                      style={modalInputStyle}
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "15px", width: "100%" }}>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        name="phone"
                        style={modalInputStyle}
                        type="text"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>MOH ID</label>
                      <input
                        name="moh_id"
                        style={modalInputStyle}
                        type="text"
                        value={formData.moh_id}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Password</label>
                    <input
                      required={!editingUser}
                      placeholder={
                        editingUser ? "Leave blank to keep current" : ""
                      }
                      name="password"
                      style={modalInputStyle}
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  {!editingUser && (
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Role</label>
                      <select
                        name="role"
                        style={modalInputStyle}
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {isParent && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div style={sectionCardStyle}>
                    <h3 style={sectionTitleStyle}>👶 Child Information</h3>
                    <div style={gridStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Child Name</label>
                        <input
                          required
                          name="child_name"
                          style={modalInputStyle}
                          type="text"
                          value={formData.child_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Child DOB</label>
                        <input
                          required
                          name="child_dob"
                          style={modalInputStyle}
                          type="date"
                          value={formData.child_dob}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Nationality</label>
                        <input
                          name="nationality"
                          style={modalInputStyle}
                          type="text"
                          value={formData.nationality}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Child Number / ID</label>
                        <input
                          name="child_number"
                          style={modalInputStyle}
                          type="text"
                          value={formData.child_number}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Language</label>
                        <input
                          name="language"
                          style={modalInputStyle}
                          type="text"
                          value={formData.language}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={sectionCardStyle}>
                    <h3 style={sectionTitleStyle}>👩 Mother Information</h3>
                    <div style={gridStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Mother Name (Username)</label>
                        <input
                          required
                          name="username"
                          style={modalInputStyle}
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Mother DOB</label>
                        <input
                          required
                          name="mother_dob"
                          style={modalInputStyle}
                          type="date"
                          value={formData.mother_dob}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Email</label>
                        <input
                          required
                          name="email"
                          style={modalInputStyle}
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Phone</label>
                        <input
                          required
                          name="phone"
                          style={modalInputStyle}
                          type="text"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div style={{ ...formGroupStyle, marginTop: "10px" }}>
                      <label style={labelStyle}>Living Address</label>
                      <textarea
                        name="living_address"
                        style={{ ...modalInputStyle, resize: "vertical" }}
                        rows="2"
                        value={formData.living_address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={{ ...formGroupStyle, marginTop: "10px" }}>
                      <label style={labelStyle}>Password</label>
                      <input
                        required={!editingUser}
                        placeholder={
                          editingUser ? "Leave blank to keep current" : ""
                        }
                        name="password"
                        style={modalInputStyle}
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div style={sectionCardStyle}>
                    <h3 style={sectionTitleStyle}>🏥 Birth Details</h3>
                    <div style={gridStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Birth Location</label>
                        <input
                          name="birth_location"
                          style={modalInputStyle}
                          type="text"
                          value={formData.birth_location}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Hospital</label>
                        <input
                          name="birth_hospital"
                          style={modalInputStyle}
                          type="text"
                          value={formData.birth_hospital}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Delivery Type</label>
                        <input
                          name="delivery_type"
                          style={modalInputStyle}
                          type="text"
                          value={formData.delivery_type}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Surgery</label>
                        <input
                          name="surgery"
                          style={modalInputStyle}
                          type="text"
                          value={formData.surgery}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Birth Weight (kg)</label>
                        <input
                          name="birth_weight"
                          style={modalInputStyle}
                          type="number"
                          step="0.01"
                          value={formData.birth_weight}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Birth Length (cm)</label>
                        <input
                          name="birth_length"
                          style={modalInputStyle}
                          type="number"
                          step="0.01"
                          value={formData.birth_length}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Head Circum. (cm)</label>
                        <input
                          name="head_circumference"
                          style={modalInputStyle}
                          type="number"
                          step="0.01"
                          value={formData.head_circumference}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={sectionCardStyle}>
                    <h3 style={sectionTitleStyle}>📝 Registration Details</h3>
                    <div style={gridStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Reg. Number</label>
                        <input
                          required
                          name="registration_number"
                          style={modalInputStyle}
                          type="text"
                          value={formData.registration_number}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Reg. Date</label>
                        <input
                          required
                          name="registration_date"
                          style={modalInputStyle}
                          type="date"
                          value={formData.registration_date}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Personnel Name</label>
                        <input
                          name="personnel_name"
                          style={modalInputStyle}
                          type="text"
                          value={formData.personnel_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Personnel Type</label>
                        <input
                          name="personnel_type"
                          style={modalInputStyle}
                          type="text"
                          value={formData.personnel_type}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={modalFooterStyle}>
                <button type="submit" style={saveBtnStyle}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={cancelBtnStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const headerContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};
const titleStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: 0,
};
const subtitleStyle = { color: "#64748b", marginTop: "5px" };
const filterBarStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  alignItems: "center",
  background: "#fff",
  padding: "15px",
  borderRadius: "12px",
};
const searchInputStyle = {
  width: "100%",
  padding: "10px 10px 10px 35px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxSizing: "border-box",
  fontSize: "0.9rem",
};
const searchIconStyle = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
};
const selectStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "white",
};
const createBtnStyle = {
  padding: "10px 20px",
  background: "#204597",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
};
const saveBtnStyle = {
  padding: "10px 25px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
  cursor: "pointer",
};
const exportBtnStyle = {
  padding: "8px 16px",
  background: "#f1f5f9",
  fontSize: "14px",
  color: "#475569",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontWeight: "500",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const cancelBtnStyle = {
  padding: "10px 20px",
  background: "#f1f5f9",
  color: "#475569",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const tableCardStyle = {
  background: "white",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRowStyle = {
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
};
const tableRowStyle = { borderBottom: "1px solid #f1f5f9" };
const headerStyle = { padding: "16px", fontSize: "12px", color: "#64748b" };
const cellStyle = { padding: "16px", fontSize: "14px", color: "#334155" };
const actionBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#3b82f6",
  cursor: "pointer",
  marginRight: "15px",
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalContentStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "16px",
  boxSizing: "border-box",
  margin: "20px 0",
};
const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: 1,
  minWidth: 0,
};
const modalInputStyle = {
  width: "100%",
  padding: "12px 15px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  fontSize: "14px",
  color: "#1e293b",
  boxSizing: "border-box",
  transition: "border 0.2s, box-shadow 0.2s",
  marginBottom: "8px",
};

const modalFooterStyle = {
  display: "flex",
  gap: "15px",
  marginTop: "30px",
  justifyContent: "flex-end",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "20px",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#334155",
};
const sectionCardStyle = {
  background: "#ffffff",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  border: "1px solid #e2e8f0",
};
const sectionTitleStyle = {
  margin: "0 0 20px 0",
  fontSize: "20px",
  color: "#1e293b",
  fontWeight: "600",
  borderBottom: "2px solid #3b82f6",
  paddingBottom: "10px",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
};
