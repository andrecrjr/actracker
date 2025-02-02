import React, { createContext, useContext, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Habit } from '../types';

// import { Container } from './styles';

const HabitFormContext = createContext<{ form?: UseFormReturn<Habit> }>({
  form: undefined,
});

export const HabitFormContextProvider = ({
  form,
  children,
}: { form: UseFormReturn<Habit>; children: React.ReactNode }) => {
  return (
    <HabitFormContext.Provider value={{ form }}>
      {children}
    </HabitFormContext.Provider>
  );
};

export const useHabitFormContext = () => {
  const ctx = useContext<{ form?: UseFormReturn<Habit> }>(HabitFormContext);
  if (!ctx) {
    throw new Error(
      'useHabitFormContext must be used within a HabitFormContextProvider',
    );
  }
  return ctx;
};
