import type { Meta, StoryObj } from '@storybook/react';

import BubbleSheetGradingPaper from './BubbleSheetGradingPaper';

const meta = {
    title: 'demo/BubbleSheetGradingPaper',
    component: BubbleSheetGradingPaper,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof BubbleSheetGradingPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
