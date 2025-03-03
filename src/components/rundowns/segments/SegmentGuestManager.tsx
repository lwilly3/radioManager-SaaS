import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import GuestSearch from '../guests/GuestSearch';
import GuestForm from '../guests/GuestForm';
import GuestList from '../guests/GuestList';
import type { Guest } from '../../../types';

interface SegmentGuestManagerProps {
  guests: Guest[];
  onAddGuest: (guest: Guest) => void;
  onRemoveGuest: (guestId: string) => void;
  onUpdateGuest: (guest: Guest) => void;
}

const SegmentGuestManager: React.FC<SegmentGuestManagerProps> = ({
  guests,
  onAddGuest,
  onRemoveGuest,
  onUpdateGuest,
}) => {
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>();

  const handleAddGuest = (guest: Guest) => {
    onAddGuest(guest);
    setShowGuestForm(false);
    setEditingGuest(undefined);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setShowGuestForm(true);
  };

  return (
    <div className="space-y-4">
      {!showGuestForm ? (
        <GuestSearch
          onSelect={onAddGuest}
          onAddNew={() => setShowGuestForm(true)}
        />
      ) : (
        <GuestForm
          onAdd={handleAddGuest}
          onCancel={() => {
            setShowGuestForm(false);
            setEditingGuest(undefined);
          }}
          initialData={editingGuest}
        />
      )}

      <GuestList
        guests={guests}
        onDelete={onRemoveGuest}
        onEdit={handleEditGuest}
      />
    </div>
  );
};

export default SegmentGuestManager;