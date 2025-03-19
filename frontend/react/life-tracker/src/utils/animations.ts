import { Variants } from 'framer-motion';

export const animations = {
  // Variantes para animações de container
  containerVariants: {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  } as Variants,
  
  // Variantes para elementos individuais dentro de um container
  itemVariants: {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  } as Variants,
  
  // Variantes para transições de página
  pageTransition: {
    hidden: {
      x: 20,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    exit: {
      x: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  } as Variants,
  
  // Variantes para botões
  buttonVariants: {
    initial: {
      scale: 1
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    }
  } as Variants,
  
  // Animação pulsante para elementos de destaque
  pulseVariants: {
    initial: {
      scale: 1,
      opacity: 1
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  } as Variants,
  
  // Animalção de loading
  loadingVariants: {
    initial: {
      rotate: 0
    },
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  } as Variants
};