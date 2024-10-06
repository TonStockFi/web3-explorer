import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import TemplateMatchingImageMulti from './demos/template_matching/TemplateMatchingImageMulti';
import { OpenCvWrapper } from './UI';

const meta = {
    title: 'demo/TemplateMatchingImageMulti',
    component: TemplateMatchingImageMulti,
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
} satisfies Meta<typeof TemplateMatchingImageMulti>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};
