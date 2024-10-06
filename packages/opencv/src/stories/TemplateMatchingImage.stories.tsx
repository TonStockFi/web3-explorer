import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import TemplateMatchingImage from './demos/template_matching/TemplateMatchingImage';
import { OpenCvWrapper } from './UI';

const meta = {
    title: 'Components/TemplateMatchingImage',
    component: TemplateMatchingImage,
    decorators: [
        Story => {
            return (
                <OpenCvWrapper>
                    <Story />
                </OpenCvWrapper>
            );
        }
    ],
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof TemplateMatchingImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
