import React from 'react';

type UserInitialProps = {
  className?: string;
  fallback?: string;
};

export function UserInitial({ className = '', fallback = 'U' }: UserInitialProps) {
  let initial = fallback;

  try {
    const data = localStorage.getItem('currentUser');
    if (data) {
      const parsed = JSON.parse(data);
      const firstName = parsed?.firstName || parsed?.name || '';
      if (firstName) initial = String(firstName).trim().split(/\s+/)[0].charAt(0).toUpperCase();
    }
  } catch (e) {
    // ignore JSON parse errors and keep fallback
  }

  return (
    <div className={`w-8 h-8 rounded-full bg-gray-300 bg-user-logo color-user-logo dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{initial}</span>
    </div>
  );
}
export function BigUserInitial({ className = '', fallback = 'U' }: UserInitialProps) {
  let initial = fallback;

  try {
    const data = localStorage.getItem('currentUser');
    if (data) {
      const parsed = JSON.parse(data);
      const firstName = parsed?.firstName || parsed?.name || '';
      if (firstName) initial = String(firstName).trim().split(/\s+/)[0].charAt(0).toUpperCase();
    }
  } catch (e) {
    // ignore JSON parse errors and keep fallback
  }

  return (
    <div className={`big-user-logo-size w-12 h-12 rounded-full bg-gray-300 bg-user-logo color-user-logo dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <span className="big-user-logo-text text-lg font-medium text-gray-700 dark:text-gray-100">{initial}</span>
    </div>
  );
}

export function NamedUserInitial({ name, className = '', fallback = 'U' }: { name?: string | null; className?: string; fallback?: string }) {
  let initial = fallback;

  if (name) {
    const first = String(name).trim().split(/\s+/)[0];
    if (first) initial = first.charAt(0).toUpperCase();
  }

  return (
    <div className={`w-8 h-8 rounded-full bg-gray-300 bg-user-logo color-user-logo dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{initial}</span>
    </div>
  );
}

export function BigNamedUserInitial({ name, className = '', fallback = 'U' }: { name?: string | null; className?: string; fallback?: string }) {
  let initial = fallback;

  if (name) {
    const first = String(name).trim().split(/\s+/)[0];
    if (first) initial = first.charAt(0).toUpperCase();
  }

  return (
    <div className={`big-user-logo-size w-12 h-12 rounded-full bg-gray-300 bg-user-logo color-user-logo dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <span className="big-user-logo-text text-lg font-medium text-gray-700 dark:text-gray-100">{initial}</span>
    </div>
  );
}

export default UserInitial;
