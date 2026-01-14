import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

const Input = React.forwardRef<TextInput, TextInputProps>(({ className, ...props }, ref) => {
  return <TextInput ref={ref} className={`border border-gray-300 rounded-md p-2 ${className}`} {...props} />;
});

export { Input };
