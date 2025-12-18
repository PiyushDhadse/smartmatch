import React, { useState } from 'react';
import ServiceCard from '../../components/ServiceCard';

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock data for services
  const services = [
    {
      id: 1,
      title: 'Plumbing Services',
      description: 'Expert plumbers for all your plumbing needs including repairs, installations, and maintenance.',
      price: 45,
      rating: 4.8,
      category: 'home',
      image: '/images/plumbing.jpg'
    },
    {
      id: 2,
      title: 'Electrical Work',
      description: 'Licensed electricians for installations, repairs, and electrical safety inspections.',
      price: 55,
      rating: 4.9,
      category: 'home',
      image: '/images/electrical.jpg'
    },
    {
      id: 3,
      title: 'Home Cleaning',
      description: 'Professional cleaning services for your home, office, or commercial space.',
      price: 35,
      rating: 4.7,
      category: 'cleaning',
      image: '/images/cleaning.jpg'
    },
    {
      id: 4,
      title: 'Tutoring',
      description: 'Expert tutors for all subjects and levels from elementary to university.',
      price: 40,
      rating: 4.9,
      category: 'education',
      image: '/images/tutoring.jpg'
    },
    {
      id: 5,
      title: 'Gardening Services',
      description: 'Professional gardeners for landscaping, lawn care, and plant maintenance.',
      price: 30,
      rating: 4.6,
      category: 'outdoor',
      image: '/images/gardening.jpg'
    },
    {
      id: 6,
      title: 'Appliance Repair',
      description: 'Experts in repairing all types of household appliances quickly and efficiently.',
      price: 50,
      rating: 4.5,
      category: 'home',
      image: '/images/appliance.jpg'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'home', name: 'Home Services' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'education', name: 'Education' },
    { id: 'outdoor', name: 'Outdoor' }
  ];

  // Filter services based on search term and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse Services</h1>
        
        {/* Search and Filter Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;