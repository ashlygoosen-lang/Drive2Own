import { Link } from "react-router";
import { Header } from "../components/Header";
import { VehicleCarousel } from "../components/VehicleCarousel";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Car, Key, Clock, Shield, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00C853] to-[#00a843] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Drive Today, Own Tomorrow
              </h1>
              <p className="text-lg md:text-xl text-green-50">
                Turn your Uber earnings into vehicle ownership. Join Drive2Own and start building equity with every ride in Cape Town.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/join">
                  <Button 
                    size="lg" 
                    className="bg-white text-[#00C853] hover:bg-gray-100 w-full sm:w-auto"
                  >
                    Get Started Now
                  </Button>
                </Link>
                <Link to="#how-it-works">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    How It Works
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-green-100">Active Drivers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-green-100">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1752250300317-d81d8d163f8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwZHJpdmVyJTIwc3RlZXJpbmclMjB3aGVlbHxlbnwxfHx8fDE3NzM0MDczOTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy Uber driver"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Carousel Section */}
      <VehicleCarousel />

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Drive2Own?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for Uber drivers in Cape Town
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Key className="w-6 h-6 text-[#00C853]" />
                </div>
                <h3 className="font-semibold">Own, Don't Rent</h3>
                <p className="text-sm text-gray-600">
                  Build equity with every payment instead of paying rental fees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-[#00C853]" />
                </div>
                <h3 className="font-semibold">Fast Approval</h3>
                <p className="text-sm text-gray-600">
                  Get approved within 24 hours with minimal paperwork
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-[#00C853]" />
                </div>
                <h3 className="font-semibold">Secure & Trusted</h3>
                <p className="text-sm text-gray-600">
                  Transparent terms and secure document handling
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-[#00C853]" />
                </div>
                <h3 className="font-semibold">Track Progress</h3>
                <p className="text-sm text-gray-600">
                  Monitor your ownership progress in real-time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#00C853] to-[#00a843] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Own Your Future?
          </h2>
          <p className="text-lg text-green-50 mb-8">
            Join hundreds of Uber drivers in Cape Town who are building wealth through vehicle ownership
          </p>
          <Link to="/join">
            <Button 
              size="lg" 
              className="bg-white text-[#00C853] hover:bg-gray-100"
            >
              Apply Now – It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#00C853] rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold">Drive2Own</span>
              </div>
              <p className="text-gray-400">
                Empowering Uber drivers in Cape Town to own their vehicles
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/join" className="hover:text-white">Join Now</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Cape Town, South Africa</li>
                <li>support@drive2own.co.za</li>
                <li>+27 (0) 21 XXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 Drive2Own. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}