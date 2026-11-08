import React from 'react';

export interface OtpInputProps {
  length?: number;
  label?: string;
  onComplete?: (code: string) => boolean | Promise<boolean>;
}

export function OtpInput(props: OtpInputProps): React.JSX.Element;

export interface CardNumberInputProps {
  label?: string;
  onChange?: (status: { complete: boolean }) => void;
}

export function CardNumberInput(props: CardNumberInputProps): React.JSX.Element;

export function scorePassword(p: string): number;

export interface PasswordStrengthProps {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export function PasswordStrength(props: PasswordStrengthProps): React.JSX.Element;

export interface AutoGrowTextareaProps {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  maxRows?: number;
  placeholder?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export function AutoGrowTextarea(props: AutoGrowTextareaProps): React.JSX.Element;

export interface TagInputProps {
  label?: string;
  tags?: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
}

export function TagInput(props: TagInputProps): React.JSX.Element;

export function emailSuggestion(t: string): string;

export interface GhostCompleteProps {
  label?: string;
  getSuggestion?: (t: string) => string;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  id?: string;
}

export function GhostComplete(props: GhostCompleteProps): React.JSX.Element;
