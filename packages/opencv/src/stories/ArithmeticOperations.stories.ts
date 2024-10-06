import type { Meta, StoryObj } from '@storybook/react';
import ArithmeticOperations from './ArithmeticOperations';

const meta = {
    title: 'demo/ArithmeticOperations',
    component: ArithmeticOperations,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof ArithmeticOperations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
