import type { Meta, StoryObj } from '@storybook/react';
import ArucoMarker from './ArucoMarker';

const meta = {
    title: 'demo/ArucoMarker',
    component: ArucoMarker,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof ArucoMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
