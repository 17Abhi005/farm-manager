
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sprout, 
  Brain, 
  BarChart3, 
  Cloud, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Play,
  Award,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Sprout,
      title: 'Smart Crop Management',
      description: 'AI-powered crop tracking from seed to harvest with predictive analytics and automated alerts.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms provide personalized recommendations to optimize your yields.',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards with real-time data visualization and performance metrics.',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      icon: Cloud,
      title: 'Weather Intelligence',
      description: 'Hyperlocal weather forecasting with climate risk assessment and planning tools.',
      gradient: 'from-sky-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and security protocols to protect your valuable farm data.',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Native mobile experience with offline capabilities for field operations.',
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  const benefits = [
    { icon: TrendingUp, text: 'Increase crop yields by up to 30%', color: 'text-green-600' },
    { icon: Award, text: 'Reduce operational costs by 25%', color: 'text-blue-600' },
    { icon: Zap, text: 'Optimize resource usage and sustainability', color: 'text-purple-600' },
    { icon: Shield, text: 'Early disease detection and prevention', color: 'text-orange-600' },
    { icon: BarChart3, text: 'Real-time financial performance tracking', color: 'text-indigo-600' },
    { icon: Cloud, text: 'Weather-based intelligent planning', color: 'text-cyan-600' }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Organic Farmer',
      content: 'FarmManager Pro transformed my 50-acre farm. The AI recommendations helped me increase my tomato yield by 40%.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Priya Sharma',
      role: 'Agricultural Consultant',
      content: 'The analytics dashboard gives me insights I never had before. My clients love the detailed reporting.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c144?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'David Chen',
      role: 'Farm Manager',
      content: 'The mobile app works perfectly in the field. Even without internet, I can track everything seamlessly.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">🌾</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  FarmManager
                </h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Benefits</a>
              <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Reviews</a>
              <Link to="/contact" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-green-50/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2316a34a%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">

          
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            The Future of
            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
              Smart Farming
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
            Revolutionize your agricultural operations with AI-powered insights, real-time monitoring, 
            and data-driven decision making that maximizes yields and profitability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-12 py-6 h-auto shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl font-semibold">
                Start Free Trial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-12 py-6 h-auto border-2 hover:bg-gray-50 transition-all duration-300 rounded-2xl font-semibold backdrop-blur-sm">
              <Play className="mr-3 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">10K+</div>
              <div className="text-gray-600 font-medium text-lg">Active Farmers</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">30%</div>
              <div className="text-gray-600 font-medium text-lg">Avg. Yield Increase</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">₹50L+</div>
              <div className="text-gray-600 font-medium text-lg">Revenue Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight">
              Comprehensive Farm Management
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Every tool you need to manage, monitor, and maximize your agricultural operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-700 group hover:-translate-y-4 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardHeader className="pb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50/50 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%2316a34a%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M50%2050c0-27.614%2022.386-50%2050-50v50H50z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
                Proven Results for
                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Modern Farmers</span>
              </h3>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light">
                Join thousands of progressive farmers who have transformed their operations with FarmManager. 
                Our platform delivers measurable improvements to productivity, profitability, and sustainability.
              </p>
              
              <div className="grid grid-cols-1 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 group">
                      <div className={`w-12 h-12 ${benefit.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${benefit.color}`} />
                      </div>
                      <span className="text-gray-700 font-semibold text-lg group-hover:text-gray-900 transition-colors duration-300">{benefit.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&h=500&fit=crop" 
                  alt="Farm management dashboard" 
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl z-20 backdrop-blur-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-2xl">+30%</p>
                    <p className="text-sm text-gray-600 font-medium">Yield Increase</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white p-6 rounded-3xl shadow-2xl z-20 backdrop-blur-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">10K+</p>
                    <p className="text-xs text-gray-600 font-medium">Farmers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight">
              Loved by Farmers
            </h3>
            <p className="text-xl text-gray-600 font-light">
              See what our community is saying about FarmManager
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-8 leading-relaxed italic text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Ready to Transform Your Farm?
          </h3>
          <p className="text-xl text-green-100 mb-12 leading-relaxed font-light">
            Join the agricultural revolution. Start your journey towards smarter, 
            more profitable farming today with a free 30-day trial.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-12 py-6 h-auto bg-white text-green-700 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl font-semibold">
              Start Free Trial
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🌾</span>
                </div>
                <p className="text-2xl font-bold">FarmManager</p>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md text-lg font-light">
                Empowering farmers worldwide with AI-powered agricultural management solutions. 
                Built for the future of sustainable farming.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                <li className="hover:text-white transition-colors cursor-pointer">API</li>
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p className="text-lg font-light">© 2025 FarmManager. All rights reserved. Built with ❤️ for farmers.</p><br/>
            <p className="text-lg font-light">Created by Abhishek Gupta</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
