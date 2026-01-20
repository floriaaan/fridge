import React from "react";
import { TextInput, TextInputProps } from "react-native";

const Input = React.forwardRef<TextInput, TextInputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        className={`border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-md p-2 ${className}`}
        placeholderTextColor="#a3a3a3"
        {...props}
      />
    );
  }
);

export { Input };
