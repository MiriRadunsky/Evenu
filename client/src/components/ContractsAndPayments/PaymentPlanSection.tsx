import { Calendar } from "lucide-react";
import type { ContractPayment } from "../../types/Contract";

interface PaymentPlanSectionProps {
  paymentPlan: ContractPayment[];
}

export function PaymentPlanSection({ paymentPlan }: PaymentPlanSectionProps) {
  if (!paymentPlan.length) return null;

  return (
    <div className="border border-primary rounded-lg bg-white p-4">
      <h4 className="font-semibold text-sm mb-3 text-black">
        תוכנית תשלומים
      </h4>

      <div className="space-y-2">
        {paymentPlan.map((payment, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-3 rounded-md border border-primary/40 text-sm bg-white"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3 h-3 text-primary" />
              {new Date(payment.dueDate).toLocaleDateString("he-IL")}
            </span>

            <span className="font-semibold text-black">
              ₪{payment.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
