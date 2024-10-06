import type { Meta, StoryObj } from '@storybook/react';
import QRCodeReadingImage from './QRCodeReadingImage';

const meta = {
    title: 'demo/QRCodeReadingImage',
    component: QRCodeReadingImage,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof QRCodeReadingImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
