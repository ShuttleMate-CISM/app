import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import images from '../assets/Images/index.js';
import { Search, ArrowRight, Menu, MapPin, ShoppingBag, Bed, Car, Users, User, Check } from 'lucide-react';
import Video from '../assets/Images/Video_intro.mp4';

const Splashscreen = () => {
  const videoRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [visibleElements, setVisibleElements] = useState(new Set());

  const features = [
    { icon: '👤', title: 'User Friendly', color: 'bg-blue-100' },
    { icon: '🗺️', title: 'Easy to Navigate', color: 'bg-green-100' },
    { icon: '👨‍💻', title: 'Offline Access', color: 'bg-purple-100' },
    { icon: '🔒', title: 'Secure and Reliable', color: 'bg-indigo-100' }
  ];


  const pricingPlans = [
    {
      name: 'Coach Pricing',
      icon: '🏸',
      originalPrice: 8000,
      price: 5000,
      type: 'Yearly Revenue',
      description: '1 User Commercial License',
      features: [
        'Add Coach Information',
        'Add Training and Marketing Videos',
        'Enable Call Functionality',
        'Add Court Details',
        'Add Available Training Times',
        'Add match details'
      ],
      support: [
        'Email and Community Support',
        'Lifetime Access and Free Updates'
      ],
      
    },
    {
      name: 'Court Owner Pricing',
      icon: '🏟️',
      originalPrice: 7000,
      price: 6000,
      type: 'Yearly Revenue',
      description: '1 User Commercial License',
      features: [
        'Add Courts Along with Their Features',
        'Upload Court Videos',
        'Navigate to Court via Google Maps',
        'Enable Location-Based Search Option',
        'Add match details'
      ],
      support: [
        'Email and Community Support',
        'Lifetime Access and Free Updates'
      ],
     
     
    },
    {
      name: 'Shop Owners Pricing',
      icon: '🛒',
      originalPrice: 8000,
      price: 6000,
      type: 'Yearly Revenue',
      description: '1 User Commercial License',
      features: [
       'Add Shop Information',
       'Enable Shop Owners to Sell Products ',
       'Integrate Online Payment Functionality',
       'Include Match Details'

      ],
      support: [
        'Email and Community Support',
        'Lifetime Access and Free Updates'
      ],
     
    },
    {
      name: 'Premium All-in-One',
      icon: '👑',
      originalPrice: 12000,
      price: 10000,
      type: 'Yearly Revenue',
      description: '1 User Commercial License',
      features: [
        'Add Videos',
        'Add coach details',
        'Add court details',
        'Add Shop details with items for online puchasing',
        'Add matches'
      ],
      support: [
        'Priority Email Support',
        'Lifetime Access and Free Updates'
      ],
      extras: [
        'All Downloadable Resources',
        'Priority Feature Requests'
      ],
       popular: true
    }
  ];

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  const handlePurchaseClick = (planName) => {
    alert(`Purchase ${planName} plan functionality would be implemented here`);
  };

  // Custom hook for intersection observer
  const useIntersectionObserver = (callback, options = {}) => {
    const elementRefs = useRef([]);

    useEffect(() => {
      const observer = new IntersectionObserver(callback, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      });

      elementRefs.current.forEach(ref => {
        if (ref) observer.observe(ref);
      });

      return () => {
        elementRefs.current.forEach(ref => {
          if (ref) observer.unobserve(ref);
        });
      };
    }, [callback, options]);

    return elementRefs;
  };

  // Intersection observer callback for animations
  const handleIntersection = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const elementId = entry.target.getAttribute('data-animate-id');
        if (elementId) {
          setVisibleElements(prev => new Set([...prev, elementId]));
        }
      }
    });
  };

  const animationRefs = useIntersectionObserver(handleIntersection);

  // Video intersection observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(console.error);
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, []);

  // Helper function to add refs and animation attributes
  const addAnimationRef = (index, type = 'default') => ({
    ref: (el) => animationRefs.current[index] = el,
    'data-animate-id': `${type}-${index}`,
    className: `animate-element ${visibleElements.has(`${type}-${index}`) ? 'animate-slide-up' : 'animate-hidden'}`
  });

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundImage: `url(${images.Bg})` }}
    >
      <style>{`
        .animate-element {
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .animate-hidden {
          opacity: 0;
          transform: translateY(50px);
        }
        
        .animate-slide-up {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-slide-up-delay-1 {
          transition-delay: 0.1s;
        }
        
        .animate-slide-up-delay-2 {
          transition-delay: 0.2s;
        }
        
        .animate-slide-up-delay-3 {
          transition-delay: 0.3s;
        }
        
        .animate-slide-up-delay-4 {
          transition-delay: 0.4s;
        }
        
        .stagger-animation > * {
          transition-delay: calc(var(--stagger-delay, 0) * 0.1s);
        }
      `}</style>

      {/* Header with Logo */}
      <div className='ml-32 flex pt-1'>
        <img src={images.logo} width={100} height={100} />
        <p className='text-white mt-8 text-2xl font-bold'>Shuttlemate</p>
      </div>

      {/* Main Content */}
      <div className='flex gap-44 items-center px-8 -mt-28'>
        <div className="flex-1 max-w-2xl relative">
          {/* Rotated Text Background */}
          <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 -rotate-90 origin-center">
            <div className="text-transparent text-6xl font-bold tracking-widest whitespace-nowrap"
              style={{
                WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)',
                textStroke: '2px rgba(255, 255, 255, 0.3)'
              }}>
              SHUTTLEMATE
            </div>
          </div>

          {/* Main Content */}
          <div className="ml-52">
            <h1 className="text-white text-5xl font-bold leading-tight mb-6">
              READY TO PLAY? WE'LL TAKE YOU THERE!<br />
            </h1>

            <div className="w-16 h-1 bg-yellow-400 mb-8"></div>

            <p className="text-white/90 text-lg mb-12 leading-relaxed max-w-lg">
              Welcome to ShuttleMate, your ultimate badminton companion and the gateway to an exciting journey through training videos, top courts, expert coaches, and premium gear all in one place.
            </p>

            <button className="bg-white rounded-lg flex items-center space-x-3 hover:bg-gray-100 transition-colors group ml-20">
              <div className="text-left">
                <img src={images.playstore} width={150} />
              </div>
            </button>
          </div>
        </div>

        <div className="ml-8">
          <img src={images.phone} height={450} width={500} alt="Phone mockup" />
        </div>
      </div>

      {/* About Section */}
      <div className="min-h-screen bg-gradient-to-br">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Mobile App Mockup */}
          <div {...addAnimationRef(0, 'about-image')}>
            <img src={images.home_phone} />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div>
              <div
                {...addAnimationRef(1, 'about-title')}
                className={`flex items-center space-x-2 mb-4 p-6 ${addAnimationRef(1, 'about-title').className}`}
              >
                <h2 className="text-3xl font-bold text-gray-800">ABOUT SHUTTLEMATE</h2>
                <div className="h-1 w-12 bg-yellow-400 rounded"></div>
              </div>

              <p
                {...addAnimationRef(2, 'about-text')}
                className={`text-gray-600 mb-6 leading-relaxed ${addAnimationRef(2, 'about-text').className} animate-slide-up-delay-1`}
              >
                ShuttleMate is your all-in-one platform designed for badminton enthusiasts of all levels. <br />Whether you're a beginner looking to learn the basics or a seasoned player aiming to level up your game<br /> ShuttleMate connects you with curated training videos, nearby courts, professional coaches, and trusted equipment suppliers. <br />Our mission is to make your badminton journey smoother, smarter, and more enjoyable—anytime, anywhere.
              </p>
            </div>

            {/* Features Grid */}
            <div
              {...addAnimationRef(3, 'features-grid')}
              className={`grid grid-cols-2 gap-4 stagger-animation ${addAnimationRef(3, 'features-grid').className}`}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{ '--stagger-delay': index }}
                  className={`p-6 rounded-xl ${feature.color} hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  </div>
                  {activeFeature === index && (
                    <div className="mt-3 text-sm text-gray-600 animate-fade-in">
                      Experience the best of Sri Lanka with {feature.title.toLowerCase()} interface.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div {...addAnimationRef(4, 'video-section')}>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          style={{
            height: '700px',
            width: '100%',
            objectFit: 'cover',
            marginTop: 30,
          }}
        >
          <source src={Video} type="video/mp4" />
        </video>
      </div>

    <div>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          <div
            {...addAnimationRef(10, 'pricing-title')}
            className={`text-center mb-16 ${addAnimationRef(10, 'pricing-title').className}`}
          >
            <h2 className='text-4xl font-bold text-gray-800 mb-4'>Choose Your ShuttlMate Plan</h2>
            <p className='text-xl text-gray-600'>Select the perfect plan for your badminton needs</p>
            <div className='w-24 h-1 bg-yellow-400 mx-auto mt-6'></div>
          </div>
          <div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  {...addAnimationRef(11 + index, 'pricing-card')}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? 'border-yellow-400 transform scale-105' : 'border-gray-200'
                    } ${addAnimationRef(11 + index, 'pricing-card').className}`}
                  style={{ '--stagger-delay': index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">{plan.icon}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-8">
                      <span className="text-gray-400 line-through text-lg mr-2">Rs.{plan.originalPrice}</span>
                      <div className="flex items-center justify-center mb-2">
                        
                        <span className="text-4xl font-bold text-gray-800">Rs.{plan.price}</span>
                        <span className="text-sm text-gray-500 mt-5"> / Yearly</span>
                      </div>
                      <p className="text-sm text-gray-500">{plan.type}</p>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePurchaseClick(plan.name)}
                      className={`w-full py-3 rounded-lg font-bold transition-all duration-300 mb-8 ${plan.popular
                          ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                        }`}
                    >
                      Purchase Now
                    </button>

                    {/* Features */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-600 text-sm mb-3">Core Features</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm">
                              <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-600 text-sm mb-3">Support</h4>
                        <ul className="space-y-2">
                          {plan.support.map((support, supportIndex) => (
                            <li key={supportIndex} className="flex items-center text-sm">
                              <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{support}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                     
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
      {/* Login/Register Section */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-20 mt-12">
        <div className="max-w-6xl mx-auto flex items-center gap-12 px-8">

          <div className="flex-1 text-white">
            <h2
              {...addAnimationRef(5, 'login-title')}
              className={`text-5xl font-bold mb-6 leading-tight ${addAnimationRef(5, 'login-title').className}`}
            >
              Join the ShuttleMate<br />
              <span className="text-yellow-400">Community</span>
            </h2>
            <div
              {...addAnimationRef(6, 'login-divider')}
              className={`w-16 h-1 bg-yellow-400 mb-8 ${addAnimationRef(6, 'login-divider').className} animate-slide-up-delay-1`}
            ></div>
            <p
              {...addAnimationRef(7, 'login-text')}
              className={`text-xl text-gray-300 mb-8 leading-relaxed ${addAnimationRef(7, 'login-text').className} animate-slide-up-delay-2`}
            >
              We warmly invite all coaches, court owners, and shop owners to register with ShuttleMate, your all-in-one platform for the badminton community. Register today and upload your details to connect with players and enthusiasts across the network. Let's grow the game together with ShuttleMate!
            </p>
            <div
              {...addAnimationRef(8, 'login-benefits')}
              className={`space-y-4 stagger-animation ${addAnimationRef(8, 'login-benefits').className}`}
            >
              <div className="flex items-center space-x-3" style={{ '--stagger-delay': 0 }}>
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">✓</div>
                <span className="text-lg">Coaches, Please Submit Your Details</span>
              </div>
              <div className="flex items-center space-x-3" style={{ '--stagger-delay': 1 }}>
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">✓</div>
                <span className="text-lg">Court Owners, Please Register Your Court</span>
              </div>
              <div className="flex items-center space-x-3" style={{ '--stagger-delay': 2 }}>
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">✓</div>
                <span className="text-lg">Submit Your Shop Details and Product Listings</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex-1 max-w-md">
            <div
              {...addAnimationRef(9, 'auth-card')}
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center ${addAnimationRef(9, 'auth-card').className} animate-slide-up-delay-3`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">Get Started Today</h3>
              <p className="text-gray-300 mb-8">Choose an option to continue your badminton journey</p>

              <div className="space-y-4">
                <button
                  onClick={handleLoginClick}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </button>

                <button
                  onClick={handleSignUpClick}
                  className="w-full bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold py-4 rounded-lg hover:bg-yellow-400 hover:text-black transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Create Account</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-gray-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splashscreen;