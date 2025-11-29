export const SKILLS_CATEGORIES = {
  // School & Academic
  'Matières Scolaires': [
    'Mathématiques',
    'Physique',
    'Chimie',
    'SVT',
    'Français',
    'Arabe',
    'Anglais',
    'Espagnol',
    'Histoire-Géographie',
    'Philosophie',
    'Economie',
  ],

  // Exam Prep
  'Préparation aux Concours': [
    'TCF',
    'TOEFL',
    'IELTS',
    'Concours ENSAM',
    'Concours Médecine',
    'Concours CNC',
    'Bac Maroc',
  ],

  // Programming & Tech
  'Programmation & Développement': [
    'Python',
    'JavaScript',
    'TypeScript',
    'Java',
    'C++',
    'PHP',
    'React',
    'React Native',
    'Angular',
    'Vue.js',
    'Node.js',
    'NestJS',
    'Django',
    'Laravel',
    'Spring Boot',
  ],

  // Data & AI
  'Data & Intelligence Artificielle': [
    'Machine Learning',
    'Deep Learning',
    'Data Science',
    'Data Analysis',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'Big Data',
    'Kafka',
    'Spark',
  ],

  // DevOps & Cloud
  'DevOps & Cloud': [
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'Google Cloud',
    'CI/CD',
    'Jenkins',
    'Git',
    'Linux',
  ],

  // Design
  'Design & Créativité': [
    'UI/UX Design',
    'Figma',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Adobe XD',
    'Sketch',
    'Graphic Design',
    '3D Modeling',
    'Blender',
    'AutoCAD',
  ],

  // Video & Photography
  'Vidéo & Photo': [
    'Montage Vidéo',
    'Adobe Premiere Pro',
    'Final Cut Pro',
    'DaVinci Resolve',
    'After Effects',
    'Photographie',
    'Lightroom',
    'Caméra',
    'Drone',
  ],

  // Business & Marketing
  'Business & Marketing': [
    'Marketing Digital',
    'SEO',
    'Google Ads',
    'Facebook Ads',
    'Community Management',
    'E-commerce',
    'Shopify',
    'Business Plan',
    'Gestion de Projet',
  ],

  // Languages
  'Langues': [
    'Anglais Débutant',
    'Anglais Intermédiaire',
    'Anglais Avancé',
    'Français Débutant',
    'Français Intermédiaire',
    'Français Avancé',
    'Arabe Classique',
    'Darija Marocain',
    'Espagnol',
    'Allemand',
    'Chinois',
  ],

  // Law & Consulting
  'Droit & Consultation': [
    'Droit des Affaires',
    'Droit Immobilier',
    'Droit du Travail',
    'Consultation Juridique',
    'Conseil Fiscal',
  ],

  // Other Skills
  'Autres Compétences': [
    'Excel Avancé',
    'PowerPoint',
    'Comptabilité',
    'Gestion RH',
    'Coaching Personnel',
    'Développement Personnel',
    'Préparation Entretien',
  ],
};

// Flatten all skills into a single array
export const ALL_SKILLS = Object.values(SKILLS_CATEGORIES).flat();
