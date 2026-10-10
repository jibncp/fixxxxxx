import React, { useState } from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  icon,
  rightElement,
  containerClassName = '',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `fi-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div className={`relative ${containerClassName}`}>
      {icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}
      <input
        id={inputId}
        placeholder=" "
        className={`peer block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 pb-2 pt-5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all ${
          icon ? 'pl-10' : ''
        } ${rightElement ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={`pointer-events-none absolute top-2 z-10 origin-[0] -translate-y-0 scale-75 transform text-xs font-medium text-slate-500 dark:text-slate-400 duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:scale-75 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 ${
          icon ? 'left-10' : 'left-3.5'
        }`}
      >
        {label}
      </label>
      {rightElement && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
};

interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  icon,
  containerClassName = '',
  className = '',
  children,
  id,
  ...props
}) => {
  const selectId = id || `fs-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div className={`relative ${containerClassName}`}>
      {icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}
      <select
        id={selectId}
        className={`peer block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 pb-2 pt-5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all ${
          icon ? 'pl-10' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <label
        htmlFor={selectId}
        className={`pointer-events-none absolute top-2 z-10 origin-[0] scale-75 transform text-xs font-medium text-slate-500 dark:text-slate-400 duration-150 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 ${
          icon ? 'left-10' : 'left-3.5'
        }`}
      >
        {label}
      </label>
    </div>
  );
};

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  containerClassName?: string;
}

export const FloatingTextarea: React.FC<FloatingTextareaProps> = ({
  label,
  containerClassName = '',
  className = '',
  id,
  ...props
}) => {
  const areaId = id || `fta-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div className={`relative ${containerClassName}`}>
      <textarea
        id={areaId}
        placeholder=" "
        className={`peer block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 pb-2.5 pt-6 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all ${className}`}
        {...props}
      />
      <label
        htmlFor={areaId}
        className="pointer-events-none absolute left-3.5 top-2 z-10 origin-[0] scale-75 transform text-xs font-medium text-slate-500 dark:text-slate-400 duration-150 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:scale-75 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
      >
        {label}
      </label>
    </div>
  );
};

// Flat Colored Minimalist Icon Container
interface FlatIconProps {
  icon: React.ReactNode;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'cyan' | 'slate';
  size?: 'sm' | 'md' | 'lg';
}

export const FlatIcon: React.FC<FlatIconProps> = ({ icon, color = 'blue', size = 'md' }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    indigo: 'bg-indigo-600 text-white',
    purple: 'bg-purple-600 text-white',
    cyan: 'bg-cyan-500 text-white',
    slate: 'bg-slate-700 text-white dark:bg-slate-800',
  };

  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  return (
    <div className={`${colorMap[color]} ${sizeMap[size]} flex items-center justify-center shrink-0 transition-transform duration-150`}>
      {icon}
    </div>
  );
};
