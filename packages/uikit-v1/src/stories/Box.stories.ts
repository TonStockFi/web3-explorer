import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
// @ts-ignore
import { Box } from '../Box';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
    title: 'Components/Box',
    component: Box,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered'
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' }
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
        children: 'Box',
        onClick: fn()
    }
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
    args: {
        backgroundColor: 'gray',
        p10: true,
        m10: true
    }
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Button: Story = {
    args: {
        button: true,
        children: 'Button'
    }
};
