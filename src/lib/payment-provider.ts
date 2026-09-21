export type PaymentMethodType = "QRIS" | "VIRTUAL_ACCOUNT" | "CREDIT_CARD" | "FREE";

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventName: string;
  method: PaymentMethodType;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  qrString?: string;
  vaNumber?: string;
  bankName?: string;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}

export interface IPaymentProvider {
  name: string;
  createTransaction(req: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<{ isPaid: boolean; paidAt?: Date }>;
}

export class MockPaymentProvider implements IPaymentProvider {
  name = "MOCK_GATEWAY";

  async createTransaction(req: PaymentRequest): Promise<PaymentResponse> {
    const txId = `MOCK-TX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    let vaNumber: string | undefined;
    let qrString: string | undefined;

    if (req.method === "QRIS") {
      qrString = `00020101021226580016ID.CO.EVENTRA.WWW01189360091800000000005204581253033605802ID5914EVENTRA INDO6007JAKARTA62070703A016304`;
    } else if (req.method === "VIRTUAL_ACCOUNT") {
      vaNumber = `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }

    return {
      success: true,
      transactionId: txId,
      vaNumber,
      bankName: "BCA Virtual Account",
      qrString,
      expiresAt,
      metadata: {
        method: req.method,
        simulated: true,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<{ isPaid: boolean; paidAt?: Date }> {
    return {
      isPaid: true,
      paidAt: new Date(),
    };
  }
}

export const activePaymentProvider = new MockPaymentProvider();
