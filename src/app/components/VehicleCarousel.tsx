import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Vehicle {
  id: number;
  name: string;
  type: string;
  category: 'Standard' | 'Comfort' | 'Premium' | 'Uber Black';
  services: string[];
  priceRange: string;
  image: string;
}

const vehicles: Vehicle[] = [
  {
    id: 1,
    name: "Toyota Corolla Quest",
    type: "Sedan",
    category: "Standard",
    services: ["Uber", "Bolt", "InDrive"],
    priceRange: "R 180,000 - R 240,000",
    image: "https://images.unsplash.com/photo-1763268265028-1631360c07dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3lvdGElMjBjb3JvbGxhJTIwd2hpdGUlMjBzZWRhbnxlbnwxfHx8fDE3NzM0MjQ5NDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    name: "Volkswagen Polo",
    type: "Sedan",
    category: "Standard",
    services: ["Uber", "Bolt", "InDrive"],
    priceRange: "R 200,000 - R 260,000",
    image: "https://images.unsplash.com/photo-1563010501-8dbf76424fb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2xrc3dhZ2VuJTIwcG9sbyUyMHNlZGFuJTIwc2lsdmVyfGVufDF8fHx8MTc3MzQyNDk0OHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    name: "Hyundai Accent",
    type: "Sedan",
    category: "Standard",
    services: ["Uber", "Bolt", "InDrive"],
    priceRange: "R 190,000 - R 250,000",
    image: "https://images.unsplash.com/photo-1721264522728-50b33aee7f11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeXVuZGFpJTIwYWNjZW50JTIwYmx1ZSUyMHNlZGFufGVufDF8fHx8MTc3MzQyNDk0OHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 4,
    name: "Mercedes-Benz C-Class",
    type: "Luxury Sedan",
    category: "Uber Black",
    services: ["Uber Black", "Bolt Premium"],
    priceRange: "R 450,000 - R 650,000",
    image: "https://images.unsplash.com/photo-1765446607390-aa61ae857a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMGJlbnolMjBjLWNsYXNzJTIwYmxhY2slMjBsdXh1cnl8ZW58MXx8fHwxNzczNDI0OTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 5,
    name: "BMW 3 Series",
    type: "Luxury Sedan",
    category: "Uber Black",
    services: ["Uber Black", "Bolt Premium"],
    priceRange: "R 500,000 - R 700,000",
    image: "https://images.unsplash.com/photo-1627845254114-e06cf7bfe77e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjAzJTIwc2VyaWVzJTIwYmxhY2slMjBzZWRhbnxlbnwxfHx8fDE3NzM0MTc2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 6,
    name: "Audi A4",
    type: "Luxury Sedan",
    category: "Uber Black",
    services: ["Uber Black", "Bolt Premium"],
    priceRange: "R 480,000 - R 680,000",
    image: "https://images.unsplash.com/photo-1767972885673-1cc21432a2ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwYTQlMjBzZWRhbiUyMGx1eHVyeXxlbnwxfHx8fDE3NzM0MjQ5NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 7,
    name: "Toyota Avanza",
    type: "MPV",
    category: "Comfort",
    services: ["Uber XL", "Bolt XL", "InDrive"],
    priceRange: "R 220,000 - R 280,000",
    image: "https://images.unsplash.com/photo-1772389192167-b427bc7c1e40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3lvdGElMjBhdmFuemElMjBzaWx2ZXIlMjBtcHZ8ZW58MXx8fHwxNzczNDI0OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 8,
    name: "Nissan Almera",
    type: "Sedan",
    category: "Standard",
    services: ["Uber", "Bolt", "InDrive"],
    priceRange: "R 185,000 - R 245,000",
    image: "https://images.unsplash.com/photo-1725196397103-c2068b9ec6cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaXNzYW4lMjBhbG1lcmElMjB3aGl0ZSUyMHNlZGFufGVufDF8fHx8MTc3MzQyNDk1M3ww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 9,
    name: "Honda Civic",
    type: "Sedan",
    category: "Comfort",
    services: ["Uber Comfort", "Bolt", "InDrive"],
    priceRange: "R 280,000 - R 380,000",
    image: "https://images.unsplash.com/photo-1760101832548-1870e1c2ad6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25kYSUyMGNpdmljJTIwc2VkYW4lMjBtb2Rlcm58ZW58MXx8fHwxNzczNDI0OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 10,
    name: "Ford Focus",
    type: "Sedan",
    category: "Standard",
    services: ["Uber", "Bolt", "InDrive"],
    priceRange: "R 195,000 - R 255,000",
    image: "https://images.unsplash.com/photo-1704222961369-bf5738613878?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JkJTIwZm9jdXMlMjBzZWRhbiUyMGdyZXl8ZW58MXx8fHwxNzczNDI0OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
];

function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      aria-label="Next slide"
    >
      <ChevronRight className="w-6 h-6 text-gray-800" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      aria-label="Previous slide"
    >
      <ChevronLeft className="w-6 h-6 text-gray-800" />
    </button>
  );
}

export function VehicleCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Uber Black':
        return 'bg-black text-white hover:bg-black';
      case 'Premium':
        return 'bg-purple-600 text-white hover:bg-purple-600';
      case 'Comfort':
        return 'bg-blue-600 text-white hover:bg-blue-600';
      default:
        return 'bg-[#00C853] text-white hover:bg-[#00C853]';
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Vehicle
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All vehicles qualify for Uber, Bolt, and InDrive. Pick the one that fits your goals.
          </p>
        </div>

        <div className="relative px-4">
          <Slider {...settings}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="px-3">
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      <ImageWithFallback
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-3 right-3 ${getCategoryColor(vehicle.category)}`}>
                        {vehicle.category}
                      </Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{vehicle.name}</h3>
                        <p className="text-sm text-gray-500">{vehicle.type}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.services.map((service) => (
                          <Badge 
                            key={service} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">Price Range</p>
                        <p className="font-semibold text-[#00C853]">{vehicle.priceRange}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Slider>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            * Final pricing depends on vehicle condition, year, and mileage
          </p>
        </div>
      </div>
    </section>
  );
}
