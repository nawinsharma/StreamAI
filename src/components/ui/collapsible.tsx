"use client";

import * as React from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CollapsibleContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

export type CollapsibleProps = HTMLAttributes<HTMLDivElement> & {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: ReactNode;
};

export function Collapsible({ open: openProp, defaultOpen = false, onOpenChange, className, children, ...props }: CollapsibleProps) {
	const [open, setOpen] = React.useState<boolean>(openProp ?? defaultOpen);
	React.useEffect(() => {
		if (typeof openProp === 'boolean') setOpen(openProp);
	}, [openProp]);

	const setOpenWrapped = React.useCallback((next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
	}, [onOpenChange]);

	return (
		<CollapsibleContext.Provider value={{ open, setOpen: setOpenWrapped }}>
			<div className={cn(className)} {...props}>{children}</div>
		</CollapsibleContext.Provider>
	);
}

export type CollapsibleTriggerProps = HTMLAttributes<HTMLButtonElement> & { children?: ReactNode; asChild?: boolean };

export function CollapsibleTrigger({ className, children, onClick, asChild, ...props }: CollapsibleTriggerProps) {
	const ctx = React.useContext(CollapsibleContext);
	const handleClick: React.MouseEventHandler = (e) => {
		ctx?.setOpen(!ctx.open);
		onClick?.(e as any);
	};
	if (asChild) {
		return (
			<span
				role="button"
				aria-expanded={ctx?.open ?? false}
				className={cn("w-full text-left", className)}
				onClick={handleClick}
				{...props as any}
			>
				{children}
			</span>
		);
	}
	return (
		<button
			type="button"
			className={cn("w-full text-left", className)}
			onClick={handleClick}
			aria-expanded={ctx?.open ?? false}
			{...props}
		>
			{children}
		</button>
	);
}

export type CollapsibleContentProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };

export function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
	const ctx = React.useContext(CollapsibleContext);
	if (!ctx) return null;
	return ctx.open ? (
		<div className={cn(className)} {...props}>
			{children}
		</div>
	) : null;
} 