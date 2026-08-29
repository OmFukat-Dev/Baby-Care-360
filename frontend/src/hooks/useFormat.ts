/**
 * Custom hook for formatting utilities
 */

export const useFormat = () => {
  const formatAge = (dateOfBirth: string): string => {
    const dob = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();
    let months = (today.getFullYear() - dob.getFullYear()) * 12 + today.getMonth() - dob.getMonth();
    if (today.getDate() < dob.getDate()) months -= 1;
    if (months < 0) return 'Invalid date of birth';
    if (months < 24) return `${months} month${months === 1 ? '' : 's'} old`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? '' : 's'} old`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return { formatAge, formatDate };
};
