import React, { useState } from 'react';
import {
    TextInput as DefaultTextInput,
    TextInputProps,
    Platform,
} from "react-native";
import tw from 'twrnc';

const TextInput = ({
    placeholderTextColor,
    ...props
}: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleEndEditing = () => {
        setIsFocused(false);
    };

    return (
        <DefaultTextInput
            {...props}
            onFocus={handleFocus}
            onEndEditing={handleEndEditing}
            style={[
                tw`bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-md h-12 px-4 text-neutral-950 dark:text-neutral-50`,
                isFocused && Platform.OS !== "web" ? tw`border-blue-500` : {},
                props.style,
            ]}
            placeholderTextColor={
                placeholderTextColor || tw.color("text-neutral-500")
            }
        />
    );
};

export default TextInput;