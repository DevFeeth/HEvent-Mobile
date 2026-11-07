export const canOrganize = (user) => user?.role_name === 'ORGANIZER' || user?.role_name === 'ADMIN';
