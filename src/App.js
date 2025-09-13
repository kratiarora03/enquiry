import { useState } from "react";
import Swal from "sweetalert2";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { FaDownload, FaTrash } from "react-icons/fa"; // ⬅️ icons
import "./App.css";
import logo from "./assets/image.png";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "",
    companyName: "",
    capacity: "", // ⬅️ Added Capacity in KWP
    enquiry: "",
  });

  const [errors, setErrors] = useState({});
  const [submissions, setSubmissions] = useState([]); // hidden, for admin use only

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile must be 10 digits";
    }
    if (!formData.type) newErrors.type = "Please select a type";
    if (formData.type === "Industrial" && !formData.companyName.trim()) {
      newErrors.companyName = "Company name is required for Industrial type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      Swal.fire({
        title: "Saved Successfully 🎉",
        text: "Your enquiry has been recorded.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // store locally (hidden, only for admin)
      setSubmissions((prev) => [...prev, formData]);

      console.log("Form Data:", formData);
    }
  };

  // ⬇️ Generate one Word file with all submissions
  const downloadAllSubmissions = async () => {
    if (submissions.length === 0) {
      Swal.fire("No Data", "No submissions available to download.", "info");
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: submissions.map((data, index) => {
            return new Paragraph({
              children: [
                new TextRun({
                  text: `Submission #${index + 1}`,
                  bold: true,
                  size: 28,
                }),
                new TextRun("\n"),
                new TextRun(`Name: ${data.name}`),
                new TextRun(`\nEmail: ${data.email}`),
                new TextRun(`\nMobile: ${data.mobile}`),
                new TextRun(`\nType: ${data.type}`),
                data.companyName
                  ? new TextRun(`\nCompany: ${data.companyName}`)
                  : null,
                data.capacity
                  ? new TextRun(`\nCapacity (KWP): ${data.capacity}`)
                  : null,
                data.enquiry ? new TextRun(`\nEnquiry: ${data.enquiry}`) : null,
                new TextRun("\n\n"),
              ].filter(Boolean),
            });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "All_Submissions.docx");
  };

  // ⬇️ Clear all submissions with confirmation
  const clearSubmissions = () => {
    if (submissions.length === 0) {
      Swal.fire("No Data", "There are no submissions to clear.", "info");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently remove all submissions.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear it",
      cancelButtonText: "No, keep them",
    }).then((result) => {
      if (result.isConfirmed) {
        setSubmissions([]);
        Swal.fire("Cleared!", "All submissions have been removed.", "success");
      }
    });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      type: "",
      companyName: "",
      capacity: "", // reset capacity
      enquiry: "",
    });
    setErrors({});
  };

  return (
    <div className="app-background">
      {/* ⬇️ Floating admin buttons outside the box */}
      <div className="admin-icons">
        <FaDownload className="icon-btn" onClick={downloadAllSubmissions} />
        <FaTrash className="icon-btn" onClick={clearSubmissions} />
      </div>

      <div className="form-box">
  <div className="form-logo">
    <img src={logo} alt="Company Logo" />
  </div>
        <h2 className="form-title">GET IN TOUCH</h2>
        <p className="form-subtitle">
          If you have any queries kindly take a moment to fill up this form, our
          representatives will contact you shortly.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-row">
            <label>Your Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-row">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Mobile */}
          <div className="form-row">
            <label>Phone Number *</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
            {errors.mobile && <span className="error">{errors.mobile}</span>}
          </div>

          {/* Type */}
          <div className="form-row">
            <label>Type *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="Commercial">Commercial</option>
              <option value="Residential">Residential</option>
              <option value="Hospital">Hospital</option>
              <option value="Industrial">Industrial</option>
              <option value="Hotels">Hotels</option>
              <option value="Farms">Farms</option>
              <option value="Others">Others</option>
            </select>
            {errors.type && <span className="error">{errors.type}</span>}
          </div>

          {/* Company Name (only for Industrial) */}
          {formData.type === "Industrial" && (
            <div className="form-row">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
              {errors.companyName && (
                <span className="error">{errors.companyName}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Capacity (kW)*</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={(e) => {
                // Only allow integers (no decimals, no letters)
                const value = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, capacity: value });
              }}
              required
              placeholder="Enter capacity in kW"
            />
          </div>

          {/* Enquiry */}
          <div className="form-row">
            <label>Customer Enquiry</label>
            <textarea
              name="enquiry"
              value={formData.enquiry}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              SUBMIT
            </button>
            <button type="button" className="reset-btn" onClick={handleReset}>
              RESET
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
