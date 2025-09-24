import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Star, Download, Eye, Plus, Heart, Briefcase, 
  Calendar, Mail, ShoppingCart, User, GraduationCap, Building, 
  FileText, Users, Gift, MapPin, Phone, Globe, Shield, Award,
  Crown, Check, X, ChevronDown, Grid, List
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Enhanced field normalization with better ID validation
const normalizeTemplateFields = (templateFields) => {
  return templateFields.map((field, index) => {
    // Enhanced ID generation and validation
    const generateValidId = () => {
      const baseId = `template_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return uuidv4(); // Always use proper UUIDs
    };

    // Validate existing ID
    const isValidId = (id) => {
      if (!id || typeof id !== 'string' || id.trim() === '') return false;
      if (['name', 'undefined', 'null', 'message', 'email'].includes(id.toLowerCase())) return false;
      if (id.length < 10) return false;
      return true;
    };

    // Create normalized field with proper ID
    const normalizedField = {
      ...field,
      id: isValidId(field.id) ? field.id : generateValidId(),
      index: index + 1,
      isTemplateField: true,
      formId: null,
      // Ensure required validations are properly structured
      validations: field.required ? 
        (field.validations || []).concat([{ type: 'required' }]).filter((v, i, arr) => 
          arr.findIndex(item => item.type === v.type) === i
        ) : 
        field.validations || [],
      // Normalize options with proper IDs
      options: field.options ? field.options.map((option, optIndex) => {
        if (typeof option === 'string') {
          return {
            id: uuidv4(),
            value: option,
            score: 0
          };
        } else if (option && typeof option === 'object') {
          return {
            id: option.id || uuidv4(),
            value: option.value || option.text || option.label || `Option ${optIndex + 1}`,
            score: option.score || 0,
            image: option.image || null
          };
        }
        return {
          id: uuidv4(),
          value: `Option ${optIndex + 1}`,
          score: 0
        };
      }) : null
    };
    
    // Remove problematic properties
    delete normalizedField.name;
    
    console.log('Normalized template field:', {
      originalId: field.id,
      newId: normalizedField.id,
      question: normalizedField.question,
      type: normalizedField.type,
      hasOptions: !!normalizedField.options,
      optionsCount: normalizedField.options?.length || 0
    });
    
    return normalizedField;
  });
};

// Complete template data with all templates included
const completeTemplates = [
  {
    id: 1,
    name: 'Wedding RSVP Form',
    category: 'Events',
    icon: Heart,
    description: 'Beautiful wedding RSVP with meal preferences, guest details, and special requests',
    isPremium: true,
    price: 29,
    downloads: 423,
    rating: 4.9,
    formData: {
      title: 'Sarah & Michael\'s Wedding RSVP',
      description: 'We can\'t wait to celebrate with you! Please let us know if you\'ll be joining us on our special day.',
      accentColor: '#be185d',
      backgroundColor: '#fdf2f8',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Guest Information',
          description: 'Please tell us about your party'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name(s) of Guest(s)',
          description: 'Please include all guests in your party',
          required: true
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Will you be attending our wedding?',
          required: true,
          options: [
            'Yes, we\'ll be there for both ceremony and reception!',
            'Ceremony only',
            'Reception only',
            'Sorry, we cannot attend'
          ]
        },
        {
          type: 'DROPDOWN',
          question: 'Number of guests attending',
          required: true,
          options: ['1 guest', '2 guests', '3 guests', '4 guests']
        },
        {
          type: 'SECTION_HEADER',
          question: 'Dining Preferences',
          description: 'Help us plan the perfect meal'
        },
        {
          type: 'CHECKBOXES',
          question: 'Dietary Requirements & Preferences',
          options: [
            'Vegetarian',
            'Vegan',
            'Gluten-free',
            'Dairy-free',
            'Nut allergy',
            'No dietary restrictions'
          ]
        },
        {
          type: 'EMAIL',
          question: 'Email Address',
          required: true,
          description: 'For any last-minute updates'
        },
        {
          type: 'PARAGRAPH',
          question: 'Special Message for the Happy Couple',
          description: 'Share your love, wishes, or favorite memories!'
        }
      ]
    }
  },
  {
    id: 2,
    name: 'Job Application Form',
    category: 'HR',
    icon: Briefcase,
    description: 'Complete job application with resume upload, experience details, and screening questions',
    isPremium: true,
    price: 49,
    downloads: 731,
    rating: 4.7,
    formData: {
      title: 'Software Developer Application',
      description: 'Join our innovative tech team! Please complete this application to be considered for the Software Developer position.',
      accentColor: '#1e40af',
      backgroundColor: '#f8fafc',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Personal Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'EMAIL',
          question: 'Email Address',
          required: true
        },
        {
          type: 'PHONE',
          question: 'Phone Number',
          required: true
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Current Location (City, State)',
          required: true
        },
        {
          type: 'URL',
          question: 'Portfolio/Website URL',
          description: 'Link to your portfolio, GitHub, or personal website'
        },
        {
          type: 'SECTION_HEADER',
          question: 'Professional Experience'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Current Job Title',
          required: true
        },
        {
          type: 'DROPDOWN',
          question: 'Years of Professional Experience',
          required: true,
          options: ['0-1 years', '2-3 years', '4-6 years', '7-10 years', '10+ years']
        },
        {
          type: 'CHECKBOXES',
          question: 'Technical Skills',
          description: 'Select all that apply to your experience level',
          options: [
            'JavaScript',
            'React',
            'Node.js',
            'Python',
            'Java',
            'SQL',
            'AWS',
            'Docker',
            'Git',
            'Agile/Scrum'
          ]
        },
        {
          type: 'DATE',
          question: 'Earliest Start Date',
          required: true
        },
        {
          type: 'PARAGRAPH',
          question: 'Why do you want to join our team?',
          required: true,
          description: 'Tell us what excites you about this opportunity'
        }
      ]
    }
  },
  {
    id: 3,
    name: 'Event Registration & Payment',
    category: 'Events',
    icon: Calendar,
    description: 'Professional event registration with ticket selection and attendee information',
    isPremium: true,
    price: 39,
    downloads: 892,
    rating: 4.8,
    formData: {
      title: 'Tech Conference 2024 Registration',
      description: 'Join us for the biggest tech conference of the year! Register now to secure your spot.',
      accentColor: '#059669',
      backgroundColor: '#f0fdf4',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Attendee Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'EMAIL',
          question: 'Email Address',
          required: true,
          description: 'Ticket and conference updates will be sent here'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Company/Organization',
          required: true
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Job Title',
          required: true
        },
        {
          type: 'SECTION_HEADER',
          question: 'Ticket Selection'
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Select Your Ticket Type',
          required: true,
          options: [
            'Early Bird - $299 (Save $100!)',
            'Regular Admission - $399',
            'VIP Pass - $699 (Includes networking dinner)',
            'Student Discount - $149 (ID required)'
          ]
        },
        {
          type: 'CHECKBOXES',
          question: 'Dietary Requirements',
          description: 'For catering purposes',
          options: [
            'Vegetarian',
            'Vegan',
            'Gluten-free',
            'Halal',
            'Kosher',
            'No dietary restrictions'
          ]
        },
        {
          type: 'CHECKBOXES',
          question: 'Topics of Interest',
          description: 'Help us customize your experience',
          options: [
            'Artificial Intelligence & Machine Learning',
            'Blockchain & Cryptocurrency',
            'Cloud Computing',
            'Cybersecurity',
            'Mobile Development',
            'Web Development',
            'DevOps',
            'Data Science'
          ]
        }
      ]
    }
  },
  {
    id: 4,
    name: 'Customer Feedback Survey',
    category: 'Survey',
    icon: Star,
    description: 'Comprehensive feedback collection with satisfaction ratings and improvement suggestions',
    isPremium: true,
    price: 35,
    downloads: 567,
    rating: 4.9,
    formData: {
      title: 'We Value Your Feedback',
      description: 'Help us improve our service by sharing your experience. Your feedback is important to us!',
      accentColor: '#7c3aed',
      backgroundColor: '#faf5ff',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'About You'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Name (Optional)'
        },
        {
          type: 'EMAIL',
          question: 'Email Address',
          required: true,
          description: 'For follow-up if needed'
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'What best describes you?',
          required: true,
          options: [
            'New customer (less than 3 months)',
            'Regular customer (3-12 months)',
            'Long-term customer (1+ years)',
            'Business customer'
          ]
        },
        {
          type: 'SECTION_HEADER',
          question: 'Your Experience'
        },
        {
          type: 'LINEAR_SCALE',
          question: 'How satisfied are you with our service overall?',
          required: true,
          scaleMin: 1,
          scaleMax: 5,
          scaleMinLabel: 'Very Dissatisfied',
          scaleMaxLabel: 'Very Satisfied'
        },
        {
          type: 'CHECKBOXES',
          question: 'Which features have you used?',
          options: [
            'Dashboard',
            'Reports & Analytics',
            'Third-party Integrations',
            'Mobile App',
            'Customer Support',
            'API'
          ]
        },
        {
          type: 'PARAGRAPH',
          question: 'What do you find most valuable about our service?',
          description: 'Tell us what you love most'
        },
        {
          type: 'PARAGRAPH',
          question: 'What could we improve?',
          description: 'Your suggestions help us get better'
        },
        {
          type: 'LINEAR_SCALE',
          question: 'How likely are you to recommend us to a friend?',
          required: true,
          description: 'This helps us measure customer satisfaction',
          scaleMin: 0,
          scaleMax: 10,
          scaleMinLabel: 'Not Likely',
          scaleMaxLabel: 'Very Likely'
        }
      ]
    }
  },
  {
    id: 5,
    name: 'Contact Us Form',
    category: 'General',
    icon: Mail,
    description: 'Simple and effective contact form for general inquiries and support requests',
    isPremium: false,
    price: 0,
    downloads: 2341,
    rating: 4.5,
    formData: {
      title: 'Get in Touch',
      description: 'We\'d love to hear from you! Send us a message and we\'ll respond as soon as possible.',
      accentColor: '#3b82f6',
      backgroundColor: '#ffffff',
      fields: [
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'EMAIL',
          question: 'Email Address',
          required: true
        },
        {
          type: 'PHONE',
          question: 'Phone Number (Optional)',
          description: 'We\'ll only call if needed'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Subject',
          required: true
        },
        {
          type: 'DROPDOWN',
          question: 'Department',
          options: [
            'General Inquiry',
            'Sales',
            'Technical Support',
            'Billing',
            'Partnerships'
          ]
        },
        {
          type: 'PARAGRAPH',
          question: 'Message',
          required: true,
          description: 'Please provide as much detail as possible'
        }
      ]
    }
  },
  {
    id: 6,
    name: 'Product Order Form',
    category: 'Business',
    icon: ShoppingCart,
    description: 'Complete product order form with item selection, quantities, and customer details',
    isPremium: false,
    price: 0,
    downloads: 1456,
    rating: 4.6,
    formData: {
      title: 'Place Your Order',
      description: 'Select your products and provide your details for a quick and easy checkout.',
      accentColor: '#ea580c',
      backgroundColor: '#fff7ed',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Customer Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'EMAIL',
          question: 'Email Address',
          required: true
        },
        {
          type: 'PHONE',
          question: 'Phone Number',
          required: true
        },
        {
          type: 'SECTION_HEADER',
          question: 'Product Selection'
        },
        {
          type: 'CHECKBOXES',
          question: 'Select Products',
          required: true,
          options: [
            'Basic Package - $99',
            'Professional Package - $199',
            'Enterprise Package - $399',
            'Add-on Services - $50',
            'Priority Support - $29'
          ]
        },
        {
          type: 'NUMBER',
          question: 'Total Quantity',
          required: true
        },
        {
          type: 'DATE',
          question: 'Preferred Delivery Date',
          required: true
        },
        {
          type: 'PARAGRAPH',
          question: 'Special Instructions',
          description: 'Any specific requirements or notes for your order'
        }
      ]
    }
  },
  {
    id: 7,
    name: 'Medical Intake Form',
    category: 'Healthcare',
    icon: User,
    description: 'Comprehensive patient intake form for healthcare providers with medical history',
    isPremium: true,
    price: 55,
    downloads: 312,
    rating: 4.8,
    formData: {
      title: 'Patient Intake Form',
      description: 'Please complete this form before your appointment. All information is confidential.',
      accentColor: '#0f766e',
      backgroundColor: '#f0fdfa',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Personal Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'DATE',
          question: 'Date of Birth',
          required: true
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Gender',
          required: true,
          options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
        },
        {
          type: 'PHONE',
          question: 'Phone Number',
          required: true
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Emergency Contact Name',
          required: true
        },
        {
          type: 'PHONE',
          question: 'Emergency Contact Phone',
          required: true
        },
        {
          type: 'SECTION_HEADER',
          question: 'Medical History'
        },
        {
          type: 'PARAGRAPH',
          question: 'Current Medications',
          description: 'List all medications, supplements, and dosages'
        },
        {
          type: 'PARAGRAPH',
          question: 'Known Allergies',
          description: 'Include drug, food, and environmental allergies'
        },
        {
          type: 'CHECKBOXES',
          question: 'Current or Past Medical Conditions',
          options: [
            'Diabetes',
            'High Blood Pressure',
            'Heart Disease',
            'Asthma',
            'Depression/Anxiety',
            'Arthritis',
            'Cancer',
            'Kidney Disease',
            'Liver Disease',
            'None of the above'
          ]
        },
        {
          type: 'PARAGRAPH',
          question: 'Reason for Today\'s Visit',
          required: true,
          description: 'Describe your symptoms or concerns'
        }
      ]
    }
  },
  {
    id: 8,
    name: 'Course Enrollment Form',
    category: 'Education',
    icon: GraduationCap,
    description: 'Student course enrollment with prerequisites, schedule preferences, and payment options',
    isPremium: false,
    price: 0,
    downloads: 789,
    rating: 4.4,
    formData: {
      title: 'Course Enrollment - Fall 2024',
      description: 'Complete your course enrollment for the upcoming semester. Please review all information carefully.',
      accentColor: '#c2410c',
      backgroundColor: '#fff7ed',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Student Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Student ID Number',
          required: true
        },
        {
          type: 'EMAIL',
          question: 'Student Email Address',
          required: true
        },
        {
          type: 'DROPDOWN',
          question: 'Academic Program',
          required: true,
          options: [
            'Computer Science',
            'Business Administration',
            'Engineering',
            'Liberal Arts',
            'Sciences',
            'Mathematics'
          ]
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Academic Year',
          required: true,
          options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
        },
        {
          type: 'SECTION_HEADER',
          question: 'Course Selection'
        },
        {
          type: 'CHECKBOXES',
          question: 'Select Courses (Maximum 6)',
          required: true,
          options: [
            'CS 101 - Introduction to Programming',
            'CS 201 - Data Structures',
            'CS 301 - Algorithms',
            'CS 401 - Software Engineering',
            'MATH 101 - Calculus I',
            'MATH 201 - Statistics',
            'ENG 101 - English Composition',
            'HIST 101 - World History'
          ]
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Schedule Preference',
          required: true,
          options: [
            'Morning classes (8:00 AM - 12:00 PM)',
            'Afternoon classes (12:00 PM - 5:00 PM)',
            'Evening classes (5:00 PM - 9:00 PM)',
            'Mixed schedule'
          ]
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Payment Method',
          required: true,
          options: [
            'Full payment upfront',
            'Installment plan (3 payments)',
            'Financial aid',
            'Scholarship'
          ]
        }
      ]
    }
  },
  {
    id: 9,
    name: 'Employee Onboarding',
    category: 'HR',
    icon: Users,
    description: 'Complete new employee onboarding checklist and information collection',
    isPremium: true,
    price: 45,
    downloads: 298,
    rating: 4.7,
    formData: {
      title: 'Welcome to the Team!',
      description: 'Please complete this onboarding form to get started with your new role.',
      accentColor: '#0369a1',
      backgroundColor: '#f0f9ff',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Personal Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Legal Name',
          required: true
        },
        {
          type: 'DATE',
          question: 'Start Date',
          required: true
        },
        {
          type: 'DROPDOWN',
          question: 'Department',
          required: true,
          options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Emergency Contact Name',
          required: true
        },
        {
          type: 'PHONE',
          question: 'Emergency Contact Phone',
          required: true
        }
      ]
    }
  },
  {
    id: 10,
    name: 'Property Rental Application',
    category: 'Real Estate',
    icon: Building,
    description: 'Comprehensive rental application with background check authorization',
    isPremium: true,
    price: 35,
    downloads: 445,
    rating: 4.6,
    formData: {
      title: 'Rental Application',
      description: 'Complete this application to be considered for the rental property.',
      accentColor: '#059669',
      backgroundColor: '#f0fdf4',
      fields: [
        {
          type: 'SECTION_HEADER',
          question: 'Applicant Information'
        },
        {
          type: 'SHORT_ANSWER',
          question: 'Full Name',
          required: true
        },
        {
          type: 'PARAGRAPH',
          question: 'Current Address',
          required: true
        },
        {
          type: 'NUMBER',
          question: 'Monthly Income',
          required: true
        },
        {
          type: 'MULTIPLE_CHOICE',
          question: 'Employment Status',
          required: true,
          options: ['Full-time', 'Part-time', 'Self-employed', 'Unemployed', 'Retired']
        }
      ]
    }
  }
];

const categories = [
  { id: 'all', name: 'All Templates', count: completeTemplates.length },
  { id: 'Events', name: 'Events', count: completeTemplates.filter(t => t.category === 'Events').length },
  { id: 'HR', name: 'Human Resources', count: completeTemplates.filter(t => t.category === 'HR').length },
  { id: 'Survey', name: 'Surveys', count: completeTemplates.filter(t => t.category === 'Survey').length },
  { id: 'General', name: 'General', count: completeTemplates.filter(t => t.category === 'General').length },
  { id: 'Business', name: 'Business', count: completeTemplates.filter(t => t.category === 'Business').length },
  { id: 'Healthcare', name: 'Healthcare', count: completeTemplates.filter(t => t.category === 'Healthcare').length },
  { id: 'Education', name: 'Education', count: completeTemplates.filter(t => t.category === 'Education').length },
  { id: 'Real Estate', name: 'Real Estate', count: completeTemplates.filter(t => t.category === 'Real Estate').length }
];

const Templates = ({ setCurrentView, onUseTemplate, onAddTemplateFields, existingFields }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showPreview, setShowPreview] = useState(null);
  const [sortBy, setSortBy] = useState('popular');

  const filteredTemplates = useMemo(() => {
    let filtered = completeTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  // Enhanced template usage handler with better error handling
  const handleUseTemplate = (template) => {
    console.log('Using template:', template.name);
    
    try {
      // Normalize fields before passing them
      const normalizedFormData = {
        ...template.formData,
        fields: normalizeTemplateFields(template.formData.fields)
      };
      
      console.log('Normalized template data:', {
        title: normalizedFormData.title,
        fieldCount: normalizedFormData.fields.length,
        fields: normalizedFormData.fields.map(f => ({
          id: f.id,
          type: f.type,
          question: f.question
        }))
      });
      
      onUseTemplate(normalizedFormData);
      setCurrentView('builder');
    } catch (error) {
      console.error('Error using template:', error);
      alert('There was an error loading the template. Please try again.');
    }
  };

  // Enhanced add fields handler
  const handleAddFields = (template) => {
    console.log('Adding template fields:', template.name);
    
    try {
      // Normalize fields before adding them
      const normalizedFields = normalizeTemplateFields(template.formData.fields);
      
      console.log('Adding normalized fields:', normalizedFields.length);
      
      onAddTemplateFields(normalizedFields);
    } catch (error) {
      console.error('Error adding template fields:', error);
      alert('There was an error adding the template fields. Please try again.');
    }
  };

  const TemplateCard = ({ template }) => {
    const IconComponent = template.icon;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group">
        {/* Template Image/Icon */}
        <div 
          className="h-48 rounded-t-lg flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: template.formData.backgroundColor }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{ backgroundColor: template.formData.accentColor }}
          />
          <IconComponent 
            className="w-16 h-16 opacity-60"
            style={{ color: template.formData.accentColor }}
          />
          {template.isPremium && (
            <div className="absolute top-3 right-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            </div>
          )}
        </div>
        
        {/* Template Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {template.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {template.rating}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {template.category}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Download className="w-4 h-4" />
              {template.downloads.toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleUseTemplate(template)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Use Template
            </button>
            <button
              onClick={() => setShowPreview(template)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
            </button>
            {existingFields && existingFields.length > 0 && (
              <button
                onClick={() => handleAddFields(template)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                title="Add fields to current form"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {template.isPremium && (
            <div className="mt-2 text-center">
              <span className="text-lg font-bold text-gray-900">${template.price}</span>
              <span className="text-sm text-gray-500 ml-1">one-time</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TemplatePreview = ({ template, onClose }) => {
    if (!template) return null;
    
    const IconComponent = template.icon;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: template.formData.backgroundColor }}
              >
                <IconComponent 
                  className="w-5 h-5"
                  style={{ color: template.formData.accentColor }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
                <p className="text-sm text-gray-600">{template.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{template.formData.title}</h3>
              <p className="text-gray-600">{template.formData.description}</p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Form Fields Preview:</h4>
              {template.formData.fields.map((field, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  {field.type === 'SECTION_HEADER' ? (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">{field.question}</h5>
                      {field.description && (
                        <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {field.question}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.description && (
                        <p className="text-xs text-gray-600 mb-2">{field.description}</p>
                      )}
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {field.type.replace('_', ' ')} Field
                      </div>
                      {field.options && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Options:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {field.options.slice(0, 3).map((option, i) => (
                              <li key={i}>{typeof option === 'string' ? option : option.value || option}</li>
                            ))}
                            {field.options.length > 3 && (
                              <li className="text-gray-400">... and {field.options.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  handleUseTemplate(template);
                  onClose();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Use This Template
              </button>
              {existingFields && existingFields.length > 0 && (
                <button
                  onClick={() => {
                    handleAddFields(template);
                    onClose();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add Fields to Current Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {filteredTemplates.length} available
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Sort */}
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          
          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={showPreview}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  );
};

export default Templates;