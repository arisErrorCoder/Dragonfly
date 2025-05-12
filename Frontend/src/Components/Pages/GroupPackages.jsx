import React from 'react';
import './GroupPackages.css';

const GroupPackages = () => {
  const packages = [
    {
      id: 1,
      name: "Corporate Retreat",
      image: "corporate-retreat.jpg",
      description: "Perfect for team building and strategy sessions",
      price: "₹25,000 per person",
      features: ["Accommodation", "Meeting Space", "Catering", "Team Activities"]
    },
    {
      id: 2,
      name: "Wedding Package",
      image: "wedding-package.jpg",
      description: "All-inclusive wedding celebration package",
      price: "₹1,50,000 starting",
      features: ["Venue Decoration", "Catering", "Photography", "Accommodation"]
    },
    {
      id: 3,
      name: "Family Reunion",
      image: "family-reunion.jpg",
      description: "Spacious accommodations for large families",
      price: "₹50,000 for 10 people",
      features: ["Private Villa", "Swimming Pool", "Chef Services", "Activity Planning"]
    }
  ];

  const handleEnquire = (packageName) => {
    // This would typically open a modal or navigate to an enquiry form
    console.log(`Enquiry for ${packageName}`);
    // Implement your enquiry logic here
  };

  return (
    <section className="group-packages-container">
      <h2 className="group-packages-title">Our Group Packages</h2>
      <p className="group-packages-subtitle">Perfect solutions for your group events</p>
      
      <div className="group-packages-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} className="group-package-card">
            <div className="group-package-image-container">
              <img 
                src={`/images/packages/${pkg.image}`} 
                alt={pkg.name} 
                className="group-package-image"
                loading="lazy"
              />
            </div>
            <div className="group-package-content">
              <h3 className="group-package-name">{pkg.name}</h3>
              <p className="group-package-description">{pkg.description}</p>
              <p className="group-package-price">{pkg.price}</p>
              
              <ul className="group-package-features">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="group-package-feature-item">
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className="group-package-enquire-btn"
                onClick={() => handleEnquire(pkg.name)}
              >
                Enquire Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GroupPackages;