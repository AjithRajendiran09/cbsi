import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { isSupabaseConfigured, supabaseAssessments } from '../services/supabase';
import { DIMENSIONS } from '../utils/constants';

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [responses, setResponses] = useState(() => {
    const saved = localStorage.getItem('cbsi_draft_responses');
    return saved ? JSON.parse(saved) : {};
  });
  const [participantInfo, setParticipantInfo] = useState(() => {
    const saved = localStorage.getItem('cbsi_draft_info');
    return saved ? JSON.parse(saved) : {};
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch active questions and dimensions
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        if (isSupabaseConfigured) {
          const qs = await supabaseAssessments.getQuestions();
          setQuestions(qs);
          setDimensions(DIMENSIONS);
          return;
        }

        const [qRes, dRes] = await Promise.all([
          api.get('/questions'),
          api.get('/dimensions'),
        ]);
        setQuestions(qRes.data.data.questions || []);
        setDimensions(dRes.data.data.dimensions || []);
      } catch (err) {
        console.error('Failed to load inventory questions:', err);
        setError('Failed to load assessment statements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  // Persist responses to localStorage
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('cbsi_draft_responses', JSON.stringify(responses));
    }
  }, [responses]);

  // Persist participant info
  useEffect(() => {
    if (Object.keys(participantInfo).length > 0) {
      localStorage.setItem('cbsi_draft_info', JSON.stringify(participantInfo));
    }
  }, [participantInfo]);

  const setResponse = (questionId, score) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const clearDraft = () => {
    setResponses({});
    setParticipantInfo({});
    setConsentGiven(false);
    setCurrentStep(1);
    localStorage.removeItem('cbsi_draft_responses');
    localStorage.removeItem('cbsi_draft_info');
  };

  const answeredCount = Object.keys(responses).length;
  const totalQuestions = questions.length || 40;
  const isComplete = answeredCount === totalQuestions && totalQuestions > 0;

  const submitAssessment = async () => {
    if (!isComplete) {
      throw new Error(`Please answer all ${totalQuestions} questions before submitting.`);
    }
    if (!consentGiven) {
      throw new Error('Please review and accept the consent declaration.');
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured) {
        const user = JSON.parse(localStorage.getItem('cbsi_user') || '{}');
        const formatted = questions.map((q) => ({
          statementNumber: q.statementNumber,
          dimensionCode: q.dimensionCode,
          score: responses[q._id || q.id] !== undefined ? responses[q._id || q.id] : 0,
          reverseScored: q.reverseScored,
        }));
        const assessment = await supabaseAssessments.submitAssessment(user, formatted, participantInfo);
        clearDraft();
        return assessment;
      }

      const formattedResponses = questions.map((q) => ({
        question: q._id,
        score: responses[q._id] !== undefined ? responses[q._id] : 0,
      }));

      const payload = {
        responses: formattedResponses,
        consentGiven: true,
        participantInfo,
      };

      const res = await api.post('/assessments', payload);
      clearDraft();
      return res.data.data.assessment;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        questions,
        dimensions,
        responses,
        setResponse,
        participantInfo,
        setParticipantInfo,
        consentGiven,
        setConsentGiven,
        loading,
        submitting,
        error,
        setError,
        answeredCount,
        totalQuestions,
        isComplete,
        clearDraft,
        submitAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
