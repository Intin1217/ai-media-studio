'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, onChange, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          'bg-muted accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg',
          className,
        )}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(Number(e.target.value));
        }}
        {...props}
      />
    );
  },
);
Slider.displayName = 'Slider';

export { Slider };
