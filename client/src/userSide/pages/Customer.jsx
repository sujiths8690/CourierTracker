// components/CustomerSection.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers, deleteCustomer } from "../../redux/features/customer/customerActions";

export default function CustomerSection({ openModal, t }) {

  const dispatch = useDispatch();

  const customers = useSelector((state) => state.customer.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  return (
    <div className="customer-section">
      {/* Header */}
      <div className="customer-header">
        <p className="customer-count" style={{ color: t.textMuted }}>
          {customers.length} customers registered
        </p>
        <button 
          onClick={() => openModal("customer-add")} 
          className="add-customer-btn"
          style={{ background: t.accent }}
        >
          + Add Customer
        </button>
      </div>

      {/* Customer Cards */}
      {customers.map(c => (
        <div 
          key={c.id} 
          className="customer-card"
          style={{ 
            background: t.surface, 
            border: `1px solid ${t.border}` 
          }}
        >
          {/* Avatar */}
          <div 
            className="customer-avatar"
            style={{ 
              background: t.accentLight, 
              color: t.accent 
            }}
          >
            {c.name[0]}
          </div>

          {/* Customer Information */}
          <div className="customer-info">
            <div className="customer-name" style={{ color: t.text }}>
              {c.name}
            </div>
            <div className="customer-address" style={{ color: t.textMuted }}>
              {c.address}
            </div>
            <div className="customer-coords" style={{ color: t.textMuted }}>
              {c.lat}°N, {c.lng}°E
            </div>
          </div>

          {/* Action Buttons */}
          <div className="customer-actions">
            <button 
              onClick={() => openModal("customer-edit", c)} 
              className="action-btn edit-btn"
              style={{ borderColor: t.border }}
            >
              Edit
            </button>
            <button 
              onClick={() => dispatch(deleteCustomer(c.id))}
              className="action-btn delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
