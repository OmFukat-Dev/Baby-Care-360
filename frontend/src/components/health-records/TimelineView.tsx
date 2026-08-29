import React from 'react';
import { TimelineEvent } from '../../types';
import { useFormat } from '../../hooks/useFormat';

interface TimelineViewProps {
  events: TimelineEvent[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const { formatDate } = useFormat();

  if (events.length === 0) {
    return <p className="empty-state">No health events recorded yet.</p>;
  }

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      vaccination: '💉',
      checkup: '🏥',
      growth: '📊',
      milestone: '🎯',
      food: '🍎',
      polio: '💧',
    };
    return icons[type] || '📌';
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      vaccination: '#f0fdf4', // soft green
      checkup: '#ecfdf5', // soft teal
      growth: '#fffbeb', // soft yellow
      milestone: '#f5f3ff', // soft lavender
      food: '#fff7ed', // soft peach
      polio: '#f0fdf4', // soft green
    };
    return colors[type] || '#fcfbfa';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccination: 'Vaccination',
      checkup: 'Checkup',
      growth: 'Growth Measurement',
      milestone: 'Milestone',
      food: 'Food Introduction',
      polio: 'Polio Immunization',
    };
    return labels[type] || type;
  };

  return (
    <div className="timeline-view">
      <div className="timeline-container">
        {events.map((event, index) => (
          <div key={`${event.type}-${event.id}`} className="timeline-item">
            <div className="timeline-marker">
              <div
                className="timeline-dot"
                style={{ backgroundColor: getEventColor(event.type) }}
              >
                {getEventIcon(event.type)}
              </div>
              {index < events.length - 1 && <div className="timeline-line" />}
            </div>
            <div
              className="timeline-content"
              style={{ backgroundColor: getEventColor(event.type) }}
            >
              <h3>{event.title}</h3>
              <p className="event-type">
                <strong>{getTypeLabel(event.type)}</strong>
              </p>
              <p className="event-date">📅 {formatDate(event.date)}</p>
              <p className="event-status">Status: {event.status}</p>

              {/* Render specific details based on event type */}
              {event.details && (
                <div className="event-details">
                  {event.type === 'vaccination' && event.details.vaccine_name && (
                    <>
                      <p>Vaccine: {event.details.vaccine_name}</p>
                      {event.details.dose_number && <p>Dose: {event.details.dose_number}</p>}
                    </>
                  )}
                  {event.type === 'checkup' && event.details.doctor_name && (
                    <>
                      <p>Doctor: {event.details.doctor_name}</p>
                      {event.details.reason && <p>Reason: {event.details.reason}</p>}
                    </>
                  )}
                  {event.type === 'growth' && (
                    <>
                      {event.details.weight && <p>Weight: {event.details.weight} kg</p>}
                      {event.details.height && <p>Height: {event.details.height} cm</p>}
                      {event.details.head_circumference && (
                        <p>Head Circumference: {event.details.head_circumference} cm</p>
                      )}
                    </>
                  )}
                  {event.type === 'milestone' && (
                    <>
                      {event.details.milestone_type && (
                        <p>Type: {event.details.milestone_type.replace(/_/g, ' ')}</p>
                      )}
                      {event.details.description && <p>{event.details.description}</p>}
                      {event.details.age_in_months && <p>Age: {event.details.age_in_months} months</p>}
                    </>
                  )}
                  {event.type === 'food' && (
                    <>
                      {event.details.food_name && <p>Food: {event.details.food_name}</p>}
                      {event.details.food_group && <p>Group: {event.details.food_group}</p>}
                      {event.details.reaction && <p>Reaction: {event.details.reaction}</p>}
                    </>
                  )}
                  {event.details.notes && <p className="event-notes">Notes: {event.details.notes}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
