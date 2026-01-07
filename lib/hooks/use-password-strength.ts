import { useMemo } from "react";

export interface PasswordStrength {
  score: number;
  label: "weak" | "fair" | "good" | "strong";
  color: string;
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(criteria).filter(Boolean).length;

    let label: PasswordStrength["label"] = "weak";
    let color = "bg-red-500";

    if (score >= 5) {
      label = "strong";
      color = "bg-green-500";
    } else if (score >= 4) {
      label = "good";
      color = "bg-blue-500";
    } else if (score >= 3) {
      label = "fair";
      color = "bg-yellow-500";
    }

    return { score, label, color, criteria };
  }, [password]);
}
