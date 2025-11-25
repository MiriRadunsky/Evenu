export interface ContractSignature {
signatureS3Key: string;
clientId?: {
_id: string;
name: string;
email: string;
};
supplierId?: {
_id: string;
user: {
name: string;
email: string;
};
}
ipAddress: string;
at: Date;
}

interface ContractPayment {
dueDate: string;
amount: number;
note: string;
}

export interface Contract {
_id: string;
s3Key: string;
status: 'טיוטה' | 'ממתין לספק' | 'ממתין ללקוח' | 'פעיל' | 'הושלם' | 'מבוטל';
basicEventSummary?: string;
supplierSignature?: ContractSignature;
clientSignatures?: ContractSignature[];
createdAt: string;
updatedAt: string;
eventId: {
_id: string;
name: string;
date: string;
};
clientId?: {
_id: string;
name: string;
email: string;
};
supplierId?: {
_id: string;
user: {
name: string;
email: string;
};
paymentPlan: ContractPayment[];
};
}