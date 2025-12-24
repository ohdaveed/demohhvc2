import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import InspectionForm from './components/InspectionForm';

export default function App() {
  return (
    <ErrorBoundary>
      <InspectionForm />
    </ErrorBoundary>
  );
}