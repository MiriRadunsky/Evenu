import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";

interface Payment {
  amount: string;
  dueDate: string;
  note: string;
}
export default function PaymentsContract({payments, setPayments}: {payments: Payment[], setPayments: (payments: Payment[]) => void}) {

// פונקציות עזר
const handleAddPayment = () => setPayments([...payments, { amount: "", dueDate: "", note: "" }]);
const handleRemovePayment = (index: number) => setPayments(payments.filter((_, i) => i !== index));
const handlePaymentChange = (index: number, field: "amount" | "dueDate"|"note", value: string) => {
  const updated = [...payments];
  updated[index][field] = value;
  setPayments(updated);
};
return(<>
<div className="space-y-2">
  <Label>תשלומים</Label>
  {payments.map((p, i) => (
    <div key={i} className="flex gap-2 items-center">
      <Input
        type="number"
        placeholder="סכום"
        value={p.amount}
        onChange={(e) => handlePaymentChange(i, "amount", e.target.value)}
        required
      />
      <Input
        type="date"
        value={p.dueDate}
        onChange={(e) => handlePaymentChange(i, "dueDate", e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="הערה"
        value={p.note}
        onChange={(e) => handlePaymentChange(i, "note", e.target.value)}
      />
      <Button type="button" variant="destructive" onClick={() => handleRemovePayment(i)}>
        X
      </Button>
    </div>
  ))}
  <Button type="button" onClick={handleAddPayment}>הוסף תשלום</Button>
</div>

</>)
}