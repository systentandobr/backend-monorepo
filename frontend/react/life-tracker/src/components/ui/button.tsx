import * as React from "react";
import { Button as HeroButton, ButtonProps as HeroButtonProps } from "@heroui/react";
import { cn } from "@/utils/cn";

// Definindo nossos tipos personalizados
type ButtonVariant = "default" | "accent" | "success" | "warning" | "error" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

// Interface para nossas props personalizadas
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any; // Para permitir qualquer outra prop de botão HTML
}

// Função para mapear nossas variantes para as do HeroUI
function mapVariantToHero(variant: ButtonVariant): HeroButtonProps["variant"] {
  const mapping: Record<ButtonVariant, HeroButtonProps["variant"]> = {
    default: "solid",
    accent: "solid",
    success: "solid",
    warning: "solid",
    error: "solid",
    outline: "bordered",
    secondary: "flat",
    ghost: "ghost",
    link: "light"
  };
  return mapping[variant];
}

// Função para mapear nossos tamanhos para os do HeroUI
function mapSizeToHero(size: ButtonSize): HeroButtonProps["size"] {
  const mapping: Record<ButtonSize, HeroButtonProps["size"]> = {
    default: "md",
    sm: "sm",
    lg: "lg",
    icon: "sm" // Fallback para 'sm'
  };
  return mapping[size];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = "default", 
    size = "default", 
    fullWidth = false, 
    rounded = false, 
    asChild = false, 
    className, 
    children, 
    ...props 
  }, ref) => {
    
    // Classes personalizadas para manter aparência consistente
    const customClasses = cn(
      variant === "accent" && "bg-accent hover:bg-accent-light text-white",
      variant === "success" && "bg-success hover:bg-success/90 text-white",
      variant === "warning" && "bg-warning hover:bg-warning/90 text-black",
      variant === "error" && "bg-error hover:bg-error/90 text-white",
      rounded && "rounded-full",
      size === "icon" && "aspect-square p-2",
      className
    );
    
    // Criando props específicas para o HeroUI
    const heroProps: HeroButtonProps = {
      ...props,
      variant: mapVariantToHero(variant),
      size: mapSizeToHero(size),
      fullWidth: fullWidth,
      className: customClasses,
    };
    
    // @ts-ignore - Ignorando verificação de tipo para contornar incompatibilidades
    return <HeroButton ref={ref} {...heroProps}>{children}</HeroButton>;
  }
);

Button.displayName = "Button";

export { Button };