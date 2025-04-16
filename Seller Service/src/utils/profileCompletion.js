const calculateProfileCompletion = (seller) => {
    const mandatoryFields = [
      'full_name', 'email', 'phone_number', 'alternate_phone_number', 'password_hash', 'business_name', 'business_type',
      'address.line1', 'address.city', 'address.state', 'address.postal_code'
    ];
    const optionalFields = [
      'gstin', 'pan_number', 'website_url', 'bank_details.account_number',
      'bank_details.ifsc_code', 'bank_details.bank_name', 'bank_details.account_holder_name'
    ];
  
    let completedFields = 0;
  
    mandatoryFields.forEach(field => {
      const [parent, child] = field.split('.');
      if (child) {
        if (seller[parent] && seller[parent][child]) completedFields++;
      } else {
        if (seller[field]) completedFields++;
      }
    });
  
    optionalFields.forEach(field => {
      const [parent, child] = field.split('.');
      if (child) {
        if (seller[parent] && seller[parent][child]) completedFields++;
      } else {
        if (seller[field]) completedFields++;
      }
    });
  
    const totalFields = mandatoryFields.length + optionalFields.length;
    return Math.round((completedFields / totalFields) * 100);
  };
  
  module.exports = { calculateProfileCompletion };