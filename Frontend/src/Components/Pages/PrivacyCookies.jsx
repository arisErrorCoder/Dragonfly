import React, { useEffect } from 'react';
import "./PrivacyCookies.css";

const PrivacyCookies = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top
  }, []);

  return (
    <div className="privacy-cookies-section">
      <h1 className="privacy-cookies-title">Privacy Policy</h1>
      <p className="privacy-cookies-date">Last Updated: 17 October 2024</p>
      <p className="privacy-cookies-intro">
        Dragonfly Hotel - The Art Hotel ("we," "us," or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, and disclose your information when you visit our website (the "Site") or make use of our services. By accessing or using our Site, you agree to the terms of this Privacy Policy.
      </p>
      
      <h2 className="privacy-cookies-subheading">1. Information We Collect</h2>
      <h3 className="privacy-cookies-subsubheading">Personal Information:</h3>
      <p>We may collect personal information that you provide to us directly when making a reservation, signing up for our newsletter, or contacting us. This includes:</p>
      <ul className="privacy-cookies-list">
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Payment information (e.g., credit card details)</li>
        <li>Address and billing information</li>
      </ul>

      <h3 className="privacy-cookies-subsubheading">Automatically Collected Information:</h3>
      <p>When you visit our Site, we may collect certain information automatically, including:</p>
      <ul className="privacy-cookies-list">
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Pages visited on our Site and the time spent on each page</li>
        <li>Referring website or search engine</li>
      </ul>

      <h2 className="privacy-cookies-subheading">2. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul className="privacy-cookies-list">
        <li>To Process Reservations: To facilitate your bookings, reservations, and payments for services.</li>
        <li>Communication: To communicate with you about your reservations, respond to inquiries, and send updates related to your stay.</li>
        <li>Marketing and Promotions: With your consent, to send you newsletters, special offers, and other marketing materials. You can opt out of these communications at any time by following the unsubscribe link in our emails.</li>
        <li>Website Improvement: To analyze usage trends and improve the functionality of our Site.</li>
        <li>Security and Fraud Prevention: To protect against unauthorized access, maintain the security of our systems, and ensure a safe environment for all users.</li>
      </ul>

      <h2 className="privacy-cookies-subheading">3. Cookies and Tracking Technologies</h2>
      <p>We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and understand how you interact with our Site.</p>
      <p>You can control or delete cookies through your browser settings. However, disabling cookies may affect the functionality of certain features on our Site.</p>

      <h2 className="privacy-cookies-subheading">4. Sharing of Your Information</h2>
      <p>We do not sell or rent your personal information to third parties. We may share your information in the following situations:</p>
      <ul className="privacy-cookies-list">
        <li>Service Providers: With third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf, such as payment processing or email delivery.</li>
        <li>Legal Requirements: When required by law, regulation, or legal process, such as in response to a court order or subpoena.</li>
        <li>Business Transfers: In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred to the acquiring company.</li>
      </ul>

      <h2 className="privacy-cookies-subheading">5. Data Security</h2>
      <p>We take the security of your personal information seriously and use appropriate technical and organizational measures to protect it. However, no security measures are 100% secure, and any transmission of data is at your own risk.</p>

      <h2 className="privacy-cookies-subheading">6. Retention of Your Information</h2>
      <p>We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy. When your information is no longer needed, we will securely delete or anonymize it.</p>

      <h2 className="privacy-cookies-subheading">7. Your Rights and Choices</h2>
      <p>You have the right to:</p>
      <ul className="privacy-cookies-list">
        <li>Access and Correction: Request a copy of the personal data we hold about you or request corrections to any inaccurate information.</li>
        <li>Deletion: Request that we delete your personal information under certain conditions.</li>
        <li>Opt-Out: Opt out of marketing communications from us at any time.</li>
      </ul>

      <h2 className="privacy-cookies-subheading">8. Children's Privacy</h2>
      <p>Our Site is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe that we may have collected information from a child under 13, please contact us immediately.</p>

      <h2 className="privacy-cookies-subheading">9. Third-Party Links</h2>
      <p>Our Site may contain links to third-party websites or services. We are not responsible for the privacy practices or the content of such websites. We encourage you to read the privacy policies of any third-party sites you visit.</p>

      <h2 className="privacy-cookies-subheading">10. Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time. Your continued use of our Site following the posting of changes constitutes your acceptance of such changes.</p>

      <h2 className="privacy-cookies-subheading">11. Contact Us</h2>
      <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
      <ul className="privacy-cookies-list">
        <li>Email: email@dragonfly.in</li>
        <li>Phone: 9820633097</li>
        <li>Address: Cts no - 69 & 72, New Chakala Link Road , Near JB Nagar, Chakala Opposite Solitaire Corporate Park, Andheri East, Mumbai, Maharashtra 400093</li>
      </ul>
    </div>
  );
};

export default PrivacyCookies;
