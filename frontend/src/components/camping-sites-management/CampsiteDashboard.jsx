import React from 'react';
import CampsiteList from './CampsiteList';
import AddCampsite from './AddCampsite';
import EditCampsite from './EditCampsite';

const CampsiteDashboard = ({ currentView, setCurrentView, campsites, handleAdd, handleUpdate, handleDelete, openEdit, itemToEdit, handleStatusChange }) => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Campsite Management Dashboard</h1>
        {currentView === 'list' && (
          <button
            onClick={() => setCurrentView('add')}
            className="bg-[#15803d] hover:bg-[#166534] text-white font-semibold py-2 px-4 rounded-md transition"
          >
            + Add New Campsite
          </button>
        )}
      </div>

      {currentView === 'list' && (
        <CampsiteList campsites={campsites} onEdit={openEdit} onDelete={handleDelete} handleStatusChange={handleStatusChange} />
      )}
      {currentView === 'add' && (
        <AddCampsite onSave={handleAdd} onCancel={() => setCurrentView('list')} />
      )}
      {currentView === 'edit' && (
        <EditCampsite item={itemToEdit} onSave={handleUpdate} onCancel={() => setCurrentView('list')} />
      )}
    </div>
  );
};
export default CampsiteDashboard;
