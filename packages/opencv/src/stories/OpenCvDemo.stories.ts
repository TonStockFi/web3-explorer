import type { Meta, StoryObj } from '@storybook/react';
import OpenCvDemo from './OpenCvDemo';

const meta = {
    title: 'demo/OpenCvDemo',
    component: OpenCvDemo,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof OpenCvDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
