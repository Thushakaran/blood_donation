export const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const HOSPITALS = [
  'Colombo General Hospital',
  'Sri Jayewardenepura General Hospital',
  'National Hospital of Sri Lanka',
  'Kandy Teaching Hospital',
  'Ruhuna University Teaching Hospital',
  'Jaffna Teaching Hospital',
  'Anuradhapura Teaching Hospital',
  'Batticaloa Teaching Hospital',
  'Negombo General Hospital',
  'Matara General Hospital',
];

export const PROVINCES = [
  'Northern',
  'NorthWestern',
  'Western',
  'NorthCentral',
  'Central',
  'Sabaragamuwa',
  'Eastern',
  'Uva',
  'Southern',
];

export const PROVINCE_DISTRICTS = {
  Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  NorthWestern: ['Puttalam', 'Kurunegala'],
  Western: ['Colombo', 'Gampaha', 'Kalutara'],
  NorthCentral: ['Anuradhapura', 'Polonnaruwa'],
  Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
  Sabaragamuwa: ['Kegalle', 'Ratnapura'],
  Eastern: ['Trincomalee', 'Batticaloa', 'Ampara'],
  Uva: ['Badulla', 'Monaragala'],
  Southern: ['Galle', 'Matara', 'Hambantota'],
};

export const DISTRICTS = [
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  'Puttalam',
  'Kurunegala',
  'Gampaha',
  'Colombo',
  'Kalutara',
  'Anuradhapura',
  'Polonnaruwa',
  'Matale',
  'Kandy',
  'Nuwara Eliya',
  'Kegalle',
  'Ratnapura',
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  'Badulla',
  'Monaragala',
  'Hambantota',
  'Matara',
  'Galle',
];

export const BLOOD_COMPATIBILITY = [
  { type: 'A+', give: 'A+, AB+', receive: 'A+, A-, O+, O-' },
  { type: 'A-', give: 'A+, A-, AB+, AB-', receive: 'A-, O-' },
  { type: 'B+', give: 'B+, AB+', receive: 'B+, B-, O+, O-' },
  { type: 'B-', give: 'B+, B-, AB+, AB-', receive: 'B-, O-' },
  { type: 'AB+', give: 'AB+', receive: 'All types (universal recipient)' },
  { type: 'AB-', give: 'AB+, AB-', receive: 'AB-, A-, B-, O-' },
  { type: 'O+', give: 'O+, A+, B+, AB+', receive: 'O+, O-' },
  { type: 'O-', give: 'All types (universal donor)', receive: 'O-' },
];
