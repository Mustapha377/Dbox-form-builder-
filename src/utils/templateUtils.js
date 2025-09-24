// templateUtils.js 

export const isTemplateField = (field, templateFields = []) => {
  if (!field || !Array.isArray(templateFields) || templateFields.length === 0) {
    return false;
  }

  // Check if this field exists in the template fields array
  // Handle both string and number IDs
  return templateFields.some(templateField => {
    // Convert both IDs to strings for comparison
    const fieldId = String(field.id);
    const templateId = String(templateField.id);
    return fieldId === templateId;
  });
};

export const getTemplateFieldStyling = (field, templateFields = []) => {
  if (!isTemplateField(field, templateFields)) {
    return {};
  }

  return {
    backgroundColor: '#fef3ff', // Light purple background
    borderColor: '#d8b4fe',     // Purple border
    className: 'template-field'
  };
};

// Helper function to mark a field as a template field
export const markAsTemplateField = (field) => {
  return {
    ...field,
    isTemplateField: true,
    // Add a prefix to ID if it doesn't already have one
    id: field.id
  };
};

// Helper function to convert template fields to regular fields
export const convertTemplateFieldsToRegular = (templateFields = []) => {
  return templateFields.map(field => {
    const { isTemplateField, ...regularField } = field;
    return regularField;
  });
};