"use client";

import * as React from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
	value?: string;
	setValue: (val: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export type SelectProps = HTMLAttributes<HTMLDivElement> & {
	value?: string;
	onValueChange?: (val: string) => void;
	children?: ReactNode;
};

export function Select({ value, onValueChange, className, children, ...props }: SelectProps) {
	const [internalValue, setInternalValue] = React.useState<string | undefined>(value);

	const setValue = React.useCallback(
		(val: string) => {
			setInternalValue(val);
			onValueChange?.(val);
		},
		[onValueChange],
	);

	const ctx: SelectContextValue = { value: internalValue, setValue };

	return (
		<SelectContext.Provider value={ctx}>
			<div className={cn("relative inline-flex", className)} {...props}>
				{children}
			</div>
		</SelectContext.Provider>
	);
}

export type SelectTriggerProps = HTMLAttributes<HTMLButtonElement> & { children?: ReactNode };

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
	return (
		<button type="button" className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-md border", className)} {...props}>
			{children}
		</button>
	);
}

export type SelectContentProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };

export function SelectContent({ className, children, ...props }: SelectContentProps) {
	return (
		<div className={cn("absolute z-50 mt-2 min-w-[12rem] rounded-md border bg-popover p-1 shadow-md", className)} {...props}>
			{children}
		</div>
	);
}

export type SelectItemProps = HTMLAttributes<HTMLDivElement> & { value: string; children?: ReactNode };

export function SelectItem({ value, className, children, onClick, ...props }: SelectItemProps) {
	const ctx = React.useContext(SelectContext);
	return (
		<div
			role="button"
			tabIndex={0}
			className={cn("cursor-pointer rounded-sm px-2 py-1 text-sm hover:bg-accent", className)}
			onClick={(e) => {
				ctx?.setValue(value);
				onClick?.(e);
			}}
			{...props}
		>
			{children}
		</div>
	);
}

export type SelectValueProps = HTMLAttributes<HTMLSpanElement> & { placeholder?: string };

export function SelectValue({ placeholder = "Select...", className, ...props }: SelectValueProps) {
	const ctx = React.useContext(SelectContext);
	return (
		<span className={cn("text-sm", className)} {...props}>
			{ctx?.value ?? placeholder}
		</span>
	);
} 