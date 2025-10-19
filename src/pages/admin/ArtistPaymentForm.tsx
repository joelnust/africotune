import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ArtistPaymentFormContent from './ArtistPaymentFormContent';

interface Props {
  asDialog?: boolean;
  onSuccess?: () => void;
}

const ArtistPaymentForm: React.FC<Props> = ({ asDialog = false, onSuccess }) => {
  if (asDialog) {
    return <ArtistPaymentFormContent onSuccess={onSuccess} />;
  }

  return (
    <DashboardLayout title="Send Member Payment Report">
      <div className="max-w-5xl mx-auto">
        <ArtistPaymentFormContent onSuccess={onSuccess} />
      </div>
    </DashboardLayout>
  );
};

export default ArtistPaymentForm;