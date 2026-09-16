// Comprehensive Mock Data for Quick-Fix

export const MOCK_CATEGORIES = [
  {
    id: "CAT-ELE",
    name: "Electrical",
    icon: "Zap",
    color: "amber",
    description: "Wiring, switchboard repair, appliance installation & emergency power fixes",
    count: 24,
    popular: true
  },
  {
    id: "CAT-PLU",
    name: "Plumbing",
    icon: "Wrench",
    color: "blue",
    description: "Pipe leak repairs, tap fitting, drain cleaning & water tank services",
    count: 18,
    popular: true
  },
  {
    id: "CAT-ACR",
    name: "AC Repair",
    icon: "Snowflake",
    color: "cyan",
    description: "AC servicing, gas filling, cooling issue fixes & fresh installation",
    count: 15,
    popular: true
  },
  {
    id: "CAT-CAR",
    name: "Carpentry",
    icon: "Hammer",
    color: "orange",
    description: "Furniture assembly, door lock fixing, cabinet installation & wood repair",
    count: 12,
    popular: false
  },
  {
    id: "CAT-CLN",
    name: "Cleaning",
    icon: "Sparkles",
    color: "emerald",
    description: "Full home deep cleaning, sofa cleaning, bathroom & kitchen sanitization",
    count: 20,
    popular: true
  },
  {
    id: "CAT-PNT",
    name: "Painting",
    icon: "Paintbrush",
    color: "purple",
    description: "Interior & exterior wall painting, waterproof coating & accent wall setup",
    count: 10,
    popular: false
  },
  {
    id: "CAT-APP",
    name: "Appliance Repair",
    icon: "Tv",
    color: "indigo",
    description: "Washing machine, refrigerator, microwave & chimney troubleshooting",
    count: 16,
    popular: true
  },
  {
    id: "CAT-HOM",
    name: "Home Maintenance",
    icon: "Home",
    color: "slate",
    description: "Drilling, TV mounting, general handyman tasks & routine maintenance",
    count: 28,
    popular: false
  }
];

export const MOCK_SERVICES = [
  {
    uniqueId: "SRV-AC01",
    categoryId: "CAT-ACR",
    categoryName: "AC Repair",
    name: "AC Deep Servicing & Jet Wash",
    shortDescription: "Foam & jet wash servicing for indoor and outdoor split AC units",
    longDescription: "Complete inspection of filters, cooling coils, drain tray cleaning, gas pressure check, and high-pressure jet wash to ensure optimal cooling performance.",
    startingPrice: 399,
    baseDistanceCharge: 50,
    estimatedDuration: "45-60 mins",
    included: [
      "Indoor unit foam & jet wash",
      "Outdoor unit high pressure wash",
      "Gas leak check & coil inspection",
      "Filter & drain line cleaning"
    ],
    excluded: [
      "Refrigerant gas top-up (charged separately)",
      "Major spare part replacements"
    ],
    rating: 4.8,
    reviewCount: 420
  },
  {
    uniqueId: "SRV-ELE01",
    categoryId: "CAT-ELE",
    categoryName: "Electrical",
    name: "Switchboard & Wiring Repair",
    shortDescription: "Fix faulty switches, socket wiring, short circuits and fuse repairs",
    longDescription: "Professional electrician checkup for short circuits, tripped MCBs, faulty socket replacements, and custom switchboard installations.",
    startingPrice: 299,
    baseDistanceCharge: 40,
    estimatedDuration: "30-45 mins",
    included: [
      "Short circuit diagnosis",
      "Up to 3 switch/socket repairs",
      "Safety voltage check"
    ],
    excluded: [
      "Cost of new branded switches or heavy wiring materials"
    ],
    rating: 4.7,
    reviewCount: 310
  },
  {
    uniqueId: "SRV-PLU01",
    categoryId: "CAT-PLU",
    categoryName: "Plumbing",
    name: "Tap Leakage & Pipe Repair",
    shortDescription: "Fix leaking taps, flush tanks, pipe joints & sink drainage blockage",
    longDescription: "Expert plumber service to resolve dripping faucets, concealed pipe leaks, flush tank mechanism replacement, and clogged sink drain clearance.",
    startingPrice: 249,
    baseDistanceCharge: 40,
    estimatedDuration: "30-50 mins",
    included: [
      "Leak inspection and washer replacement",
      "Up to 2 tap/faucet fittings",
      "Basic drain blockage removal"
    ],
    excluded: [
      "Heavy underground pipe excavation",
      "New tap or faucet hardware purchase"
    ],
    rating: 4.6,
    reviewCount: 280
  },
  {
    uniqueId: "SRV-CLN01",
    categoryId: "CAT-CLN",
    categoryName: "Cleaning",
    name: "Full Bathroom Deep Cleaning",
    shortDescription: "Tile scrubbing, hard water stain removal, toilet & mirror polishing",
    longDescription: "Comprehensive deep sanitization of bathroom tiles, shower fittings, toilet bowl, washbasin, and hard water scale removal using eco-friendly solutions.",
    startingPrice: 499,
    baseDistanceCharge: 60,
    estimatedDuration: "60-90 mins",
    included: [
      "Tile scaling & hard water stain removal",
      "Sanitization of toilet seat & washbasin",
      "Mirror & glass enclosure polishing"
    ],
    excluded: [
      "Grout replacement or tile re-pointing"
    ],
    rating: 4.9,
    reviewCount: 512
  }
];

export const MOCK_PROVIDERS = [
  {
    providerUniqueId: "PRO-X92KD4",
    providerName: "Kumar AC & Electrical Services",
    contactPerson: "Rajesh Kumar",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
    phone: "+91 98765 43210",
    email: "kumar.services@example.com",
    rating: 4.8,
    reviewCount: 142,
    distance: 1.2,
    availability: "AVAILABLE_NOW",
    estimatedTime: "15-20 mins away",
    experienceYears: 6,
    completedJobs: 320,
    startingPrice: 350,
    estimatedPrice: 400,
    verified: true,
    recommended: true,
    recommendationReason: "⭐ Recommended for You — Fastest response time & 1.2 km away",
    coordinates: { lat: 11.0168, lng: 76.9558 }, // Coimbatore center offset
    address: "R.S. Puram, Coimbatore, Tamil Nadu",
    services: ["AC Repair", "AC Servicing", "Switchboard Wiring", "Fan Installation"],
    bio: "Certified HVAC & electrical technician with over 6 years of hands-on experience in residential and commercial service repairs. Guaranteed customer satisfaction.",
    reviews: [
      {
        id: "REV-101",
        customerName: "Anand R.",
        rating: 5,
        date: "2 days ago",
        comment: "Rajesh arrived in just 20 minutes! Super clean AC servicing and fixed the noise issue completely."
      },
      {
        id: "REV-102",
        customerName: "Priya S.",
        rating: 4.5,
        date: "1 week ago",
        comment: "Very professional. Identified the short circuit in my kitchen switchboard right away."
      }
    ]
  },
  {
    providerUniqueId: "PRO-Y81AB9",
    providerName: "CoolTech Solutions",
    contactPerson: "Suresh Mani",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    phone: "+91 98123 76543",
    email: "cooltech@example.com",
    rating: 4.7,
    reviewCount: 98,
    distance: 2.4,
    availability: "AVAILABLE_IN_30_MIN",
    estimatedTime: "30 mins away",
    experienceYears: 8,
    completedJobs: 245,
    startingPrice: 399,
    estimatedPrice: 450,
    verified: true,
    recommended: false,
    coordinates: { lat: 11.0250, lng: 76.9650 },
    address: "Gandhipuram, Coimbatore, Tamil Nadu",
    services: ["AC Repair", "Refrigerant Gas Filling", "AC Installation"],
    bio: "Specialists in inverter AC models, ductless split systems, and commercial cooling maintenance.",
    reviews: [
      {
        id: "REV-103",
        customerName: "Venkatesh K.",
        rating: 5,
        date: "3 days ago",
        comment: "Suresh and his team did an outstanding job installing my new split AC unit."
      }
    ]
  },
  {
    providerUniqueId: "PRO-Z73PLU",
    providerName: "Quick Flow Plumbing & Leak Experts",
    contactPerson: "Arun Prakash",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80",
    phone: "+91 97654 32109",
    email: "quickflow@example.com",
    rating: 4.6,
    reviewCount: 115,
    distance: 3.1,
    availability: "AVAILABLE_NOW",
    estimatedTime: "25-30 mins away",
    experienceYears: 5,
    completedJobs: 180,
    startingPrice: 299,
    estimatedPrice: 380,
    verified: true,
    recommended: false,
    coordinates: { lat: 11.0080, lng: 76.9420 },
    address: "Saibaba Colony, Coimbatore, Tamil Nadu",
    services: ["Tap & Pipe Repair", "Bathroom Plumbing", "Water Tank Cleaning"],
    bio: "Emergency leak response team equipped with modern thermal cameras and pressure gauge tools.",
    reviews: [
      {
        id: "REV-104",
        customerName: "Deepa N.",
        rating: 4,
        date: "5 days ago",
        comment: "Fixed a persistent flush tank leak fast. Reasonably priced distance charges."
      }
    ]
  },
  {
    providerUniqueId: "PRO-M45CLN",
    providerName: "Sparkle Clean Home Pros",
    contactPerson: "Kavitha M.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
    phone: "+91 94321 09876",
    email: "sparkleclean@example.com",
    rating: 4.9,
    reviewCount: 210,
    distance: 1.8,
    availability: "AVAILABLE_TODAY",
    estimatedTime: "Slots available today",
    experienceYears: 7,
    completedJobs: 410,
    startingPrice: 499,
    estimatedPrice: 550,
    verified: true,
    recommended: true,
    recommendationReason: "⭐ Highly Rated Cleaning Expert — 4.9 Rating & 410+ Completed Jobs",
    coordinates: { lat: 11.0310, lng: 76.9510 },
    address: "Peelamedu, Coimbatore, Tamil Nadu",
    services: ["Bathroom Deep Cleaning", "Full Home Cleaning", "Sofa Sanitization"],
    bio: "Professional eco-friendly home sanitization team. We bring our own heavy-duty machinery and non-toxic materials.",
    reviews: [
      {
        id: "REV-105",
        customerName: "Karthik B.",
        rating: 5,
        date: "Yesterday",
        comment: "My bathrooms look brand new after their deep stain scaling treatment. Exceptional quality!"
      }
    ]
  }
];

export const MOCK_CUSTOMER = {
  customerUniqueId: "CUST-912A3",
  name: "Ajay Ram",
  email: "ajay.ram@example.com",
  phone: "+91 98401 23456",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  memberSince: "Jan 2025",
  activeBookingCount: 1,
  completedBookingCount: 12,
  savedAddressCount: 3
};

export const MOCK_SAVED_ADDRESSES = [
  {
    id: "ADDR-01",
    label: "Home",
    type: "HOME",
    isDefault: true,
    addressLine1: "Flat 4B, Silver Heights Apartments",
    addressLine2: "123 DB Road, R.S. Puram",
    city: "Coimbatore",
    state: "Tamil Nadu",
    postalCode: "641002",
    latitude: 11.0125,
    longitude: 76.9515
  },
  {
    id: "ADDR-02",
    label: "Office / Work",
    type: "WORK",
    isDefault: false,
    addressLine1: "Suite 302, TIDEL Park Tech Zone",
    addressLine2: "Civil Aerodrome Post, Peelamedu",
    city: "Coimbatore",
    state: "Tamil Nadu",
    postalCode: "641014",
    latitude: 11.0285,
    longitude: 77.0010
  },
  {
    id: "ADDR-03",
    label: "Parents' House",
    type: "OTHER",
    isDefault: false,
    addressLine1: "45 Cross Cut Road",
    addressLine2: "Near Bus Stand, Gandhipuram",
    city: "Coimbatore",
    state: "Tamil Nadu",
    postalCode: "641012",
    latitude: 11.0180,
    longitude: 76.9680
  }
];

export const MOCK_BOOKINGS = [
  {
    bookingUniqueId: "BKG-7F82LM",
    serviceUniqueId: "SRV-AC01",
    serviceName: "AC Deep Servicing & Jet Wash",
    categoryName: "AC Repair",
    customerUniqueId: "CUST-912A3",
    customerName: "Ajay Ram",
    customerPhone: "+91 98401 23456",
    customerAddress: "Flat 4B, Silver Heights Apartments, 123 DB Road, R.S. Puram, Coimbatore",
    customerCoordinates: { lat: 11.0125, lng: 76.9515 },
    providerUniqueId: "PRO-X92KD4",
    providerName: "Kumar AC & Electrical Services",
    providerPhone: "+91 98765 43210",
    providerAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
    providerRating: 4.8,
    bookingDate: "2026-09-17",
    bookingTime: "10:30 AM",
    distanceKm: 1.2,
    serviceCharge: 300,
    distanceCharge: 100,
    totalPrice: 400,
    paymentMethod: "Pay after Service (Cash / UPI)",
    status: "PROVIDER_ACCEPTED", // BOOKING_CREATED, PROVIDER_SELECTED, WAITING_ACCEPTANCE, PROVIDER_ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
    statusHistory: [
      { status: "BOOKING_CREATED", time: "2026-09-16 20:45", title: "Booking Request Created", desc: "Request submitted by customer" },
      { status: "PROVIDER_SELECTED", time: "2026-09-16 20:46", title: "Provider Selected", desc: "Assigned to Kumar AC & Electrical Services" },
      { status: "PROVIDER_ACCEPTED", time: "2026-09-16 20:48", title: "Provider Accepted", desc: "Rajesh Kumar accepted your job request" }
    ],
    createdAt: "2026-09-16T20:45:00Z"
  },
  {
    bookingUniqueId: "BKG-3K91AA",
    serviceUniqueId: "SRV-ELE01",
    serviceName: "Switchboard & Wiring Repair",
    categoryName: "Electrical",
    customerUniqueId: "CUST-912A3",
    customerName: "Ajay Ram",
    customerPhone: "+91 98401 23456",
    customerAddress: "Flat 4B, Silver Heights Apartments, R.S. Puram",
    providerUniqueId: "PRO-X92KD4",
    providerName: "Kumar AC & Electrical Services",
    providerPhone: "+91 98765 43210",
    bookingDate: "2026-09-10",
    bookingTime: "02:00 PM",
    distanceKm: 1.2,
    serviceCharge: 250,
    distanceCharge: 80,
    totalPrice: 330,
    status: "COMPLETED",
    createdAt: "2026-09-10T11:00:00Z"
  },
  {
    bookingUniqueId: "BKG-9P42BB",
    serviceUniqueId: "SRV-CLN01",
    serviceName: "Full Bathroom Deep Cleaning",
    categoryName: "Cleaning",
    customerUniqueId: "CUST-912A3",
    customerName: "Ajay Ram",
    customerPhone: "+91 98401 23456",
    customerAddress: "Flat 4B, Silver Heights Apartments, R.S. Puram",
    providerUniqueId: "PRO-M45CLN",
    providerName: "Sparkle Clean Home Pros",
    providerPhone: "+91 94321 09876",
    bookingDate: "2026-09-02",
    bookingTime: "11:30 AM",
    distanceKm: 1.8,
    serviceCharge: 450,
    distanceCharge: 100,
    totalPrice: 550,
    status: "COMPLETED",
    createdAt: "2026-09-02T08:30:00Z"
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "NOTIF-01",
    title: "Provider Accepted Your Request",
    message: "Kumar AC & Electrical Services accepted your booking BKG-7F82LM for tomorrow at 10:30 AM.",
    timestamp: "10 minutes ago",
    read: false,
    type: "SUCCESS",
    link: "/customer/bookings/BKG-7F82LM/track"
  },
  {
    id: "NOTIF-02",
    title: "Upcoming Service Reminder",
    message: "Your AC Deep Servicing is scheduled for 20 Sep 2026 at 10:30 AM.",
    timestamp: "1 hour ago",
    read: false,
    type: "INFO",
    link: "/customer/bookings/BKG-7F82LM"
  },
  {
    id: "NOTIF-03",
    title: "Service Completed",
    message: "Booking BKG-3K91AA was marked complete by provider. Leave a review!",
    timestamp: "6 days ago",
    read: true,
    type: "SUCCESS",
    link: "/customer/reviews"
  }
];
