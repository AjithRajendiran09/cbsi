export const ROLES = {
  PARTICIPANT: 'participant',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

export const DIMENSION_CODES = ['LS', 'CC', 'AT', 'AR', 'II'];

export const RESPONSE_SCALE = {
  0: 'Never',
  1: 'Rarely',
  2: 'Often',
  3: 'Almost Always',
};

export const INTERPRETATION_LABELS = {
  DEVELOPING: 'Developing',
  MODERATE: 'Moderately Demonstrated',
  STRONG: 'Strongly Demonstrated',
};

export const INTERPRETATION_DESCRIPTIONS = {
  Developing:
    'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
  'Moderately Demonstrated':
    'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
  'Strongly Demonstrated':
    'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
};

export const CURRENT_VERSION = '1.0';

export const AUDIT_ACTIONS = {
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_SUBMITTED: 'assessment_submitted',
  ASSESSMENT_REOPENED: 'assessment_reopened',
  QUESTION_CREATED: 'question_created',
  QUESTION_MODIFIED: 'question_modified',
  QUESTION_DEACTIVATED: 'question_deactivated',
  QUESTION_DELETED: 'question_deleted',
  DIMENSION_MODIFIED: 'dimension_modified',
  USER_CREATED: 'user_created',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_DEACTIVATED: 'user_deactivated',
  DATA_EXPORTED: 'data_exported',
  LOGIN: 'login',
  LOGIN_FAILED: 'login_failed',
  CLASS_CREATED: 'class_created',
  CLASS_UPDATED: 'class_updated',
  CLASS_DELETED: 'class_deleted',
};
