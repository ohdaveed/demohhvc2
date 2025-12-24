export const VIOLATION_DATABASE = {
  // --- VECTORS & PESTS ---
  'rodent': { 
    code: 'Sec 581(b)(13)', 
    title: 'Rodent Infestation', 
    condition: 'Evidence of rodent activity (burrows, droppings, rub marks) or active harborage observed.', 
    importance: 'Rodent infestation poses a significant health risk due to the potential spread of diseases like Leptospirosis and Hantavirus. Rodents can also damage property and contaminate food.',
    action: 'Seal all entry points >1/4 inch with concrete or steel mesh. Remove food sources. Install rodent-proof containers for garbage. Implement a regular pest control program.' 
  },
  'rodent burrows': { 
    code: 'Sec 581(b)(13)', 
    title: 'Rodent Burrows (Infestation)', 
    condition: 'Active rodent burrows observed in soil, planters, or exterior grounds.', 
    importance: 'Burrows indicate an established rodent population nesting on the property, posing immediate health risks.',
    action: 'Collapse burrows after treatment. Install exclusion barriers (wire mesh) in planters. Contract licensed pest control to treat the exterior grounds.' 
  },
  'frass': { 
    code: 'Sec 581(b)(8)', 
    title: 'Insect Frass (Excrement)', 
    condition: 'Accumulation of insect frass (droppings) observed on surfaces.', 
    importance: 'Frass indicates an active infestation of wood-destroying or vector insects (like cockroaches or termites). It can contaminate surfaces and degrade air quality.',
    action: 'Clean and sanitize all affected surfaces. Identify the insect source and implement targeted pest control treatment.' 
  },
  'cockroach': { 
    code: 'Sec 581(b)(8)', 
    title: 'Cockroach Infestation', 
    condition: 'Live/dead cockroaches, frass, or egg cases observed.', 
    importance: 'Cockroaches carry bacteria and allergens that can trigger asthma and transmit diseases like Salmonella and E. coli.',
    action: 'Deep clean to remove grease and food residue. Seal cracks/crevices. Apply gel baits per IPM guidelines. Eliminate moisture sources.' 
  },
  'bed bug': { 
    code: 'Sec 581(b)(8)', 
    title: 'Bed Bug Infestation', 
    condition: 'Live bed bugs, cast skins, or fecal spotting observed on bedding or furniture.', 
    importance: 'Bed bugs cause physical discomfort, allergic reactions, and significant psychological distress to residents.',
    action: 'Launder all linens/clothing on high heat. Steam clean furniture. Employ a licensed PCO for chemical/heat treatment of the unit and adjacent units.' 
  },
  'fly': { 
    code: 'Sec 581(b)(8)', 
    title: 'Noxious Insect Harborage (Flies)', 
    condition: 'Accumulation of fly frass (fly excrement) or excessive fly activity observed.', 
    importance: 'Flies can transmit pathogens like Salmonella and Shigella to food and surfaces.',
    action: 'Thoroughly clean and sanitize surfaces affected by fly frass. Identify and eliminate breeding sources (e.g. unsealed garbage). Install screens.' 
  },
  'mosquitoes': { 
    code: 'Sec 581(b)(8)', 
    title: 'Mosquito Breeding Hazard', 
    condition: 'Standing water observed supporting mosquito larvae breeding.', 
    importance: 'Mosquitoes are vectors for diseases such as West Nile Virus and Zika Virus.',
    action: 'Drain standing water immediately. Maintain drains/gutters to prevent accumulation. Install screens on windows/doors.' 
  },
  'pigeon': { 
    code: 'Sec 581(b)(7)', 
    title: 'Pigeon Harborage', 
    condition: 'Accumulation of pigeon guano, nesting materials, or roosting observed.', 
    importance: 'Pigeon guano can harbor fungal spores (Histoplasmosis) and parasites.',
    action: 'Remove all nesting materials and guano using proper PPE. Install exclusion devices (netting, spikes) to prevent roosting.' 
  },
  
  // --- SANITATION ---
  'uncontainerized garbage': { 
    code: 'Sec 581(b)(1)', 
    title: 'Uncontainerized Garbage', 
    condition: 'Loose, unbagged, or exposed garbage observed outside of approved containers.', 
    importance: 'Uncontainerized garbage provides an easily accessible food source for rodents and vectors, rapidly increasing infestation rates.',
    action: 'Place all loose garbage into approved, tight-fitting lidded containers immediately. Clean the surrounding area of debris.' 
  },
  'garbage': { 
    code: 'Sec 581(b)(1)', 
    title: 'Accumulation of Garbage/Refuse', 
    condition: 'Accumulated refuse, debris, or loose garbage observed.', 
    importance: 'Excessive garbage accumulation attracts pests (rodents, insects), creates unsanitary conditions, and can lead to vector-borne diseases.',
    action: 'Regularly remove all trash. Store it in sealed, tight-fitting containers. Ensure proper disposal according to local regulations.' 
  },
  'paper': { 
    code: 'Sec 581(b)(3)', 
    title: 'Accumulation of Paper Materials', 
    condition: 'Excessive stacking of paper/combustibles creating fire hazard or pest harborage.', 
    importance: 'Paper accumulation provides nesting material for rodents and creates a fire hazard.',
    action: 'Remove excessive paper materials. Organize remaining items to eliminate pest harborage and fire risks.' 
  },
  'excessive': { 
    code: 'Sec 581(b)(18)', 
    title: 'Excessive Materials (Hoarding)', 
    condition: 'Accumulation of items obstructing egress or preventing sanitary maintenance.', 
    importance: 'Clutter prevents proper cleaning, allows pests to hide, and blocks emergency exits.',
    action: 'Reduce clutter to allow for cleaning and pest control access. Ensure clear paths of egress.' 
  },
  'waste': { 
    code: 'Sec 581(b)(5)', 
    title: 'Contamination by Human/Animal Waste', 
    condition: 'Accumulation of feces observed.', 
    importance: 'Fecal matter contains pathogens and parasites that pose a direct threat to human health.',
    action: 'Immediately remove and properly dispose of all waste. Sanitize the affected area. Implement a maintenance schedule.' 
  },
  'poison_oak': { 
    code: 'Sec 581(b)(11)', 
    title: 'Poison Oak', 
    condition: 'Poison oak observed in areas accessible to tenants or the public.', 
    importance: 'Poison oak causes severe allergic skin reactions.',
    action: 'Remove and properly dispose of all poison oak plants. Treat area to prevent regrowth.' 
  },
  
  // --- STRUCTURAL ---
  'bathroom': { 
    code: 'Sec 581(b)(4)', 
    title: 'Unsanitary Bathroom/Toilet', 
    condition: 'Toilet, sink, or bathroom surfaces are unsanitary, leaking, or in disrepair.', 
    importance: 'Unsanitary bathrooms can spread bacteria and mold.',
    action: 'Repair plumbing fixtures. Seal gaps. Deep clean and sanitize all bathroom surfaces.' 
  },
  'kitchen': { 
    code: 'Sec 581(b)(4)', 
    title: 'Unsanitary Common Kitchen', 
    condition: 'Kitchen surfaces, equipment, or floors are soiled.', 
    importance: 'Soiled kitchens attract pests and cause foodborne illness.',
    action: 'Degrease and sanitize all kitchen surfaces, behind equipment, and floors.' 
  },
  'surfaces': { 
    code: 'Sec 581(b)(1)', 
    title: 'Unsanitary Floor, Walls, & Ceiling', 
    condition: 'Surfaces are damaged, soiled, or peeling.', 
    importance: 'Damaged surfaces cannot be properly cleaned and may harbor pests or mold.',
    action: 'Repair damaged surfaces to be smooth and cleanable. Repaint or seal as necessary.' 
  },
  'mold': { 
    code: 'Sec 581(b)(6)', 
    title: 'Mold Growth', 
    condition: 'Visible mold growth observed on walls, ceilings, or fixtures.', 
    importance: 'Mold exposure can cause respiratory problems, allergic reactions, and other health issues, particularly for vulnerable populations.',
    action: 'Remove all mold. Clean and disinfect the area. Ensure proper ventilation. Identify and repair the underlying moisture source.' 
  },
  'hallways': { 
    code: 'Sec 581(b)(5)', 
    title: 'Unsanitary Hallways', 
    condition: 'Common hallways are soiled, obstructed, or in disrepair.', 
    importance: 'Unsanitary hallways affect quality of life and can harbor allergens.',
    action: 'Clean carpets/floors. Remove obstructions. Maintain hallways in a sanitary condition.' 
  },
  'vents': { 
    code: 'Sec 581(b)(1)', 
    title: 'Structural Harborage (Broken Vent/Screen)', 
    condition: 'Broken vents or screens observed allowing potential pest entry.', 
    importance: 'Open vents provide direct entry points for rodents and insects.',
    action: 'Repair or replace damaged vents/screens with 1/4 inch mesh to prevent pest entry.' 
  }
};

export const VIOLATION_CHECKLIST = {
  pests: [
    { id: 'rodent', label: 'Rodents (Sec 581(b)(13))' },
    { id: 'cockroach', label: 'Cockroaches (Sec 581(b)(8))' },
    { id: 'bedbug', label: 'Bed Bugs (Sec 581(b)(8))' },
    { id: 'flies', label: 'Flies (Sec 581(b)(8))' },
    { id: 'mosquitoes', label: 'Mosquitoes (Sec 581(b)(8))' },
    { id: 'pigeons', label: 'Pigeons (Sec 581(b)(7))' },
  ],
  sanitation: [
    { id: 'garbage_area', label: 'Garbage Area (Sec 581(b)(1))' },
    { id: 'refuse', label: 'Refuse Accumulation (Sec 581(b)(5))' },
    { id: 'paper', label: 'Accum. Paper Materials (Sec 581(b)(3))' },
    { id: 'excessive', label: 'Excessive Materials (Sec 581(b)(18))' },
    { id: 'waste', label: 'Human/Animal Waste (Sec 581(b)(1))' },
    { id: 'poison_oak', label: 'Poison Oak (Sec 581(b)(11))' },
  ],
  structural: [
    { id: 'bathroom', label: 'Unsanitary Bathroom (Sec 581(b)(4))' },
    { id: 'kitchen', label: 'Unsanitary Kitchen (Sec 581(b)(4))' },
    { id: 'surfaces', label: 'Unsanitary Walls/Floors (Sec 581(b)(1))' },
    { id: 'mold', label: 'Mold Growth (Sec 581(b)(6))' },
    { id: 'hallways', label: 'Unsanitary Hallways (Sec 581(b)(5))' },
    { id: 'vents', label: 'Broken Vents/Screens (Sec 581(b)(1))' },
  ]
};

export const AREAS_INSPECTED = [
  'Alleyway/Easement', 'Basement', 'Front/Backyard', 'Garage/Driveway', 
  'Garbage Area', 'Hallways', 'Laundry Room', 'Lightwells', 
  'Lobby', 'Roof', 'Staircase', 'Bathroom', 'Kitchen', 'Unit(s)'
];

export const INITIAL_TAGS = [
  'Rodent Burrows', 'Frass', 'Uncontainerized Garbage', 
  'Rodent', 'Cockroach', 'Mold', 'Leaking Pipe', 'Broken Window', 
  'Animal Waste', 'Overgrown Vegetation', 'Fly', 'Bed Bug', 'Hole in Wall'
];
