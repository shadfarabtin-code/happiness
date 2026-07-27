import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from "@rneui/themed";

type DropdownComponentProps = {
  data: { label: string; value: string }[];
  value: string
  onChangeValue: (string: string) => void;
};

export const DropdownComponent = ({ data, value, onChangeValue }: DropdownComponentProps) => {
    const { theme } = useTheme()

    return (
        <View>
            <Dropdown style={{
                width: '98%',
                alignSelf: 'center',
                borderColor: theme.colors?.grey3,
                height: 50,
                borderWidth: 0.5,
                borderRadius: 8,
                paddingHorizontal: 8,
            }}
                placeholderStyle={{ fontSize: 18, color: theme.colors?.grey3 }}
                selectedTextStyle={{ fontSize: 18, fontFamily: "System" }}
                data={data}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Role"
                value={value}
                onChange={item => {
                    onChangeValue(item.value);
                }}
            />
        </View>
    );
};