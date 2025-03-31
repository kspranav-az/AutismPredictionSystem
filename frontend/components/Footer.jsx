const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm mb-4">
          © 2024 AIMED – Empowering Early Autism Diagnosis Through AI.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:underline">
            Facebook
          </a>
          <a href="#" className="hover:underline">
            Twitter
          </a>
          <a href="#" className="hover:underline">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
