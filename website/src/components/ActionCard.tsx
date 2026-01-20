import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: "default" | "positive" | "negative" | "accent";
  delay?: number;
}

const ActionCard = ({
  icon,
  title,
  description,
  onClick,
  variant = "default",
  delay = 0,
}: ActionCardProps) => {
  const variantStyles = {
    default: "from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20",
    positive: "from-positive/10 to-positive/5 hover:from-positive/20 hover:to-positive/10 border-positive/20",
    negative: "from-negative/10 to-negative/5 hover:from-negative/20 hover:to-negative/10 border-negative/20",
    accent: "from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border-accent/20",
  };

  const iconStyles = {
    default: "from-primary to-primary/70",
    positive: "from-positive to-positive/70",
    negative: "from-negative to-negative/70",
    accent: "from-accent to-accent/70",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full p-6 rounded-2xl bg-gradient-to-br border backdrop-blur-sm",
        "text-left transition-all duration-300 shadow-soft hover:shadow-medium",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-soft",
          iconStyles[variant]
        )}>
          <div className="text-primary-foreground">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};

export default ActionCard;
