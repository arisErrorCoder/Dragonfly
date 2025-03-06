import React, { useEffect } from 'react';
import './FAQ.css';

const faqData = [
  {
    category: "FAQ",
    items: [
      { question: "What is Dragonfly Surprises?", answer: "Dragonfly Surprises is a boutique event planning service based in Mumbai that offers highly customizable 3-hour, 4-hour, or overnight event packages, including personalized decorations, entertainment, and gourmet meals." },
      { question: "Where is Dragonfly Surprises located?", answer: "We operate in Mumbai, primarily from Dragonfly Hotels and Serviced Apartments, located in Andheri East." },
      { question: "What types of events do you host?", answer: "We specialize in intimate events such as anniversaries, candlelight dinners, birthdays, proposals, and other small, meaningful celebrations." },
      { question: "Can I customize every aspect of my event?", answer: "Yes! From the theme and decor to the menu and entertainment, we tailor each detail to your preferences." },
      { question: "What if I need help during my event?", answer: "Our on-site event coordinator will be available throughout your event to assist with any last-minute needs or concerns." },
    ],
  },
  {
    category: "Booking and Payments",
    items: [
      { question: "How can I book an event with Dragonfly Surprises?", answer: "You can book your event directly on our website through our easy-to-use booking portal, or contact our team via phone or email." },
      { question: "How far in advance should I book my event?", answer: "We recommend booking at least 2 weeks in advance to ensure availability and sufficient time for customization." },
      { question: "What payment methods do you accept?", answer: "We accept all major credit cards, UPI payments, and bank transfers." },
      { question: "Do you require a deposit?", answer: "Yes, a 50% deposit is required to confirm your booking, with the balance due on the day of the event." },
      { question: "Can I cancel or reschedule my booking?", answer: "Please read our Cancellation Policy here." },
      { question: "What do the 3-hour, 4-hour, and overnight event packages include?", answer: "Both packages include venue setup, customizable decorations, personalized menus, entertainment options, and dedicated event coordination." },
      { question: "Can I extend the event duration beyond the package hours?", answer: "Yes, you can extend your event for an additional hourly fee, subject to availability." },
      { question: "Do you offer catering services?", answer: "Yes, we offer a wide range of gourmet meal options customized to your dietary preferences and event theme." },
      { question: "Can I bring my own decorations or entertainment?", answer: "While we provide a complete event setup, you are welcome to bring personal touches. Let us know in advance, and we’ll incorporate them into the event." },
      { question: "Do you accommodate special requests, such as proposals or surprise elements?", answer: "Absolutely! Our team specializes in creating unforgettable moments and is happy to accommodate special requests." },
    ],
  },
];

const FAQ = () => {
  const handleToggle = (e) => {
    const panel = e.currentTarget.closest('.faq-item'); // Ensure we're toggling the correct parent element
    panel.classList.toggle('open');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="faq-container">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-grid">
        {faqData.map((section, index) => (
          <div className="faq-category" key={index}>
            <h2 className="faq-category-title">{section.category}</h2>
            {section.items.map((item, idx) => (
              <div className="faq-item" key={idx}>
                <button className="faq-question" onClick={handleToggle}>
                  {item.question}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
