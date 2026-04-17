import { Link } from "react-router-dom";
import Title from "../components/Title";

const PrivacyPolicy = () => {
  return (
    <div className="border-t pt-16 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="text-2xl mb-8">
        <Title text1={"PRIVACY"} text2={"POLICY"} />
      </div>

      <div className="max-w-4xl mx-auto text-gray-700 space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-gray-700 italic">
            This Privacy Policy is specifically tailored for Loknath Sofa Center in Barasat, incorporating 
            our specific business details and ensuring compliance with the Indian Information Technology Act, 2000 
            and the Digital Personal Data Protection (DPDP) Act.
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-4">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>
          <div className="text-sm text-gray-700 mb-6 space-y-1">
            <p><strong>Business Entity:</strong> Loknath Sofa Center</p>
            <p><strong>Location:</strong> Barasat, West Bengal</p>
          </div>
        </div>

        <section>
          <p className="text-sm leading-relaxed mb-4">
            This Privacy Policy explains how Loknath Sofa Center (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, protects, 
            and handles your personal information. By using our services or visiting our shop, you agree to 
            the terms outlined below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed mb-3">
            We collect only the essential information required to fulfill your furniture orders and provide customer support:
          </p>
          <ul className="list-disc list-inside text-sm space-y-2 ml-4">
            <li><strong>Identity Information:</strong> Name and contact person details.</li>
            <li><strong>Contact Information:</strong> Phone number, email address, and physical delivery address.</li>
            <li><strong>Transaction Details:</strong> Records of the products you purchased and the date of transaction.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. No Storage of Payment Details</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-3">
            <p className="text-sm font-semibold text-gray-800 mb-2">Crucial Security Note:</p>
            <p className="text-sm leading-relaxed">
              To ensure the highest level of security for our customers, Loknath Sofa Center does not store any 
              credit card, debit card, or bank account details. All digital payments are processed through secure, 
              third-party encrypted gateways. We do not have access to, nor do we keep logs of, your sensitive 
              financial information.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Purpose of Data Collection</h2>
          <p className="text-sm leading-relaxed mb-2">Your data is used strictly for:</p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4">
            <li>Processing and delivering your furniture orders to your specified address.</li>
            <li>Providing after-sales support and warranty services.</li>
            <li>Complying with GST and other legal tax requirements under West Bengal state law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Protection</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold mb-2">No Sale of Data:</p>
              <p className="text-sm leading-relaxed ml-4">
                We never sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Service Providers:</p>
              <p className="text-sm leading-relaxed ml-4">
                We only share your address and phone number with trusted delivery partners to ensure your furniture 
                reaches you safely.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Security:</p>
              <p className="text-sm leading-relaxed ml-4">
                We implement &quot;Reasonable Security Practices&quot; as per Section 43A of the IT Act to protect your data 
                from unauthorized access.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-sm leading-relaxed mb-2">As a customer, you have the right to:</p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4">
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Request the correction of any inaccurate information.</li>
            <li>Request the deletion of your data (subject to tax and legal record-keeping requirements).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Grievance Redressal (Mandatory under Indian Law)</h2>
          <p className="text-sm leading-relaxed mb-4">
            If you have any questions, concerns, or complaints regarding your privacy or this policy, please contact 
            our designated Grievance Officer:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
            <p><strong>Attn:</strong> Koustav Das</p>
            <p><strong>Address:</strong> Bidhan Park, Barasat, Kolkata-700124, West Bengal.</p>
            <p><strong>Email:</strong> <a href="mailto:loknathsofacenter@gmail.com" className="hover:text-primary-500 transition-colors">loknathsofacenter@gmail.com</a></p>
            <p><strong>Phone:</strong> +91 91239 24645</p>
          </div>
          <p className="text-sm leading-relaxed mt-4 italic text-gray-600">
            We commit to acknowledging any grievance within 24 hours and resolving it within 15 working days.
          </p>
        </section>
      </div>

      <div className="mt-12 pb-8 text-center">
        <Link 
          to="/" 
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 text-sm font-medium rounded transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

