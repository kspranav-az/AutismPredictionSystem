"use client";

import Footer from "./Footer";
import { useRouter } from "next/navigation";
const LandingPage = () => {
  const router = useRouter();

  const GetStarted = () => {
    router.push("/home");
  };

  return (
    <div className="bg-white text-black font-sans relative">
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="flex animate-slideX h-screen w-[100vh] sm:w-fit ">
            <img
              src="./images/img5.jpg"
              alt="Background 1"
              className="w-[150vh] sm:w-screen h-full object-cover"
            />
            <img
              src="./images/img3.jpg"
              alt="Background 2"
              className="w-[150vh] sm:w-screen h-full object-cover"
            />
            <img
              src="./images/img2.jpg"
              alt="Background 3"
              className="w-[150vh] sm:w-screen h-full object-cover"
            />
            <img
              src="./images/img1.jpg"
              alt="Background 3"
              className="w-[150vh] sm:w-screen h-full object-cover"
            />

            <img
              src="./images/img5.jpg"
              alt="Background 1"
              className="w-[200vh] h-full object-cover"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

        <img
          src="./images/aimed_logo.jpg"
          alt="AIMED Logo"
          className="z-20 w-40 mb-8 rounded-2xl"
        />

        <h1 className="text-5xl font-bold mb-4 text-center text-white z-20">
          Transforming Autism Diagnosis
        </h1>
        <p className="text-xl mb-6 text-center max-w-3xl text-white z-20">
          Harnessing the power of voice and video analysis for accurate, early
          identification of autism in educational and NGO settings.
        </p>
        <button
          onClick={GetStarted}
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 z-20"
        >
          Get Started
        </button>

        <a
          href="#about"
          className="absolute bottom-10 z-20 flex justify-center items-center w-12 h-12 rounded-full border-2 border-white text-white hover:bg-gray-700 transition-all "
        >
          <span className=" animate-bounce">↓</span>
        </a>
      </section>

      <section id="about" className="py-16 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">About AIMED</h2>
          <p className="text-lg leading-7 text-gray-700">
            AIMED is a revolutionary system designed to support early autism
            diagnosis by combining cutting-edge AI with multimodal analysis
            techniques. Our mission is to empower educators, parents, and NGOs
            with the tools they need to identify and address autism early,
            enabling timely interventions for better outcomes.
          </p>
        </div>
      </section>

      <section className="py-16 px-8 bg-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Multimodal Detection</h3>
            <p className="text-gray-700">
              Utilizes advanced voice and video analysis to detect signs of
              autism from multiple behavioral cues.
            </p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold mb-4">AI Precision</h3>
            <p className="text-gray-700">
              Leverages machine learning models trained on diverse datasets to
              ensure accurate and reliable assessments.
            </p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Real-Time Results</h3>
            <p className="text-gray-700">
              Delivers fast insights, enabling early and effective action in
              educational and care settings.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Testimonials</h2>
          <p className="italic text-gray-700 border-l-4 border-black pl-4">
            "AIMED has transformed the way we identify and support children with
            autism in our school."
          </p>
          <p className="text-right mt-2">— Educator/NGO Partner</p>
        </div>
      </section>

      <section className="py-16 bg-black text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Get Involved</h2>
        <p className="text-lg mb-6 max-w-3xl mx-auto">
          Partner with AIMED to bring this innovative technology to your
          community. Collaborate with us to refine and expand our capabilities.
        </p>
        <button
          onClick={GetStarted}
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200"
        >
          Get Started
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
