"use client";

import React, { useState } from "react";
import {
  X,
  Ticket,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface TicketTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quota: number;
  soldCount: number;
  perksJson?: string | null;
}

interface RegistrationField {
  id: string;
  label: string;
  name: string;
  fieldType: string;
  isRequired: boolean;
  optionsJson?: string | null;
  placeholder?: string | null;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    startDate: string | Date;
    ticketTypes: TicketTier[];
    registrationFields?: RegistrationField[];
  };
}

export function CheckoutModal({ isOpen, onClose, event }: CheckoutModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>(
    event.ticketTypes[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "VIRTUAL_ACCOUNT" | "CREDIT_CARD">("QRIS");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    ticketNumber: string;
    qrPayload: string;
    attendeeName: string;
    tier: string;
    total: number;
  } | null>(null);

  if (!isOpen) return null;

  const currentTier = event.ticketTypes.find((t) => t.id === selectedTierId) || event.ticketTypes[0];
  const subtotal = (currentTier?.price || 0) * quantity;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SAVE20") {
      const disc = subtotal * 0.2;
      setDiscountAmount(disc);
      setAppliedCoupon("SAVE20 (20% OFF)");
      toast.success("Promo code applied: 20% discount!");
    } else if (code === "DEVFEST50K") {
      const disc = Math.min(50000, subtotal);
      setDiscountAmount(disc);
      setAppliedCoupon("DEVFEST50K (Rp50.000 OFF)");
      toast.success("Promo code applied: Rp50.000 discount!");
    } else if (code === "STUDENTVIP") {
      const disc = subtotal * 0.3;
      setDiscountAmount(disc);
      setAppliedCoupon("STUDENTVIP (30% OFF)");
      toast.success("Student discount applied: 30% off!");
    } else {
      toast.error("Invalid coupon code. Try SAVE20 or DEVFEST50K");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      toast.error("Please provide your name and email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ticketTypeId: currentTier.id,
          quantity,
          customerName,
          customerEmail,
          customerPhone,
          company,
          jobTitle,
          couponCode: appliedCoupon ? couponCode : undefined,
          paymentMethod,
          customFields: customAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderResult({
          orderNumber: data.order.orderNumber,
          ticketNumber: data.ticket.ticketNumber,
          qrPayload: data.ticket.qrPayload,
          attendeeName: data.ticket.attendeeName,
          tier: data.ticket.tier,
          total: data.order.total,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success("Registration confirmed! Your signed QR ticket is ready.");
      } else {
        toast.error(data.message || "Failed to process order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error during checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Instant Ticket Checkout
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">{event.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {orderResult ? (
            /* Order Success State */
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white">Payment & Ticket Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Order <strong className="text-slate-200">{orderResult.orderNumber}</strong> has been registered.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-indigo-900/50 max-w-sm mx-auto text-left shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Event Pass</span>
                    <h5 className="font-bold text-sm text-white">{orderResult.attendeeName}</h5>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 font-mono font-bold">
                    {orderResult.tier}
                  </span>
                </div>

                <div className="py-4 flex flex-col items-center justify-center">
                  <div className="p-3 bg-white rounded-lg shadow-inner">
                    <QrCode className="w-32 h-32 text-slate-900" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-300 mt-3 tracking-wider">
                    {orderResult.ticketNumber}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically Signed Ticket
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Paid: {formatCurrency(orderResult.total)}</span>
                  <span className="text-indigo-400 font-medium">Valid for Admission</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    toast.success("Ticket pass downloaded as PDF (Simulated)");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Digital PDF Ticket
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                >
                  Done & Back to Event
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Step 1: Select Ticket Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Ticket Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {event.ticketTypes.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    const isSoldOut = tier.soldCount >= tier.quota;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => !isSoldOut && setSelectedTierId(tier.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 text-white"
                            : isSoldOut
                            ? "bg-slate-950/50 border-slate-800 opacity-50 cursor-not-allowed"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{tier.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div className="text-sm font-black text-indigo-400 mt-1">
                          {formatCurrency(tier.price)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {isSoldOut ? "Sold Out" : `${tier.quota - tier.soldCount} tickets left`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Contact & Attendee Information */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Attendee Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Siti Rahma"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. siti@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 081234567890"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Company / University</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. GoTo / ITB"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Form Fields if present */}
              {event.registrationFields && event.registrationFields.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Event Custom Questionnaire
                  </label>
                  <div className="space-y-3">
                    {event.registrationFields.map((field) => (
                      <div key={field.id}>
                        <label className="text-[11px] text-slate-400 mb-1 block">
                          {field.label} {field.isRequired && "*"}
                        </label>
                        {field.fieldType === "SELECT" && field.optionsJson ? (
                          <select
                            value={customAnswers[field.id] || ""}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Select option...</option>
                            {JSON.parse(field.optionsJson).map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={field.placeholder || ""}
                            value={customAnswers[field.id] || ""}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Coupon Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  3. Promo Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Try 'SAVE20' or 'DEVFEST50K'"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    ✓ {appliedCoupon} applied
                  </div>
                )}
              </div>

              {/* Step 4: Payment Method Selection */}
              {total > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    4. Simulated Payment Provider
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "QRIS", label: "QRIS Instant", icon: <QrCode className="w-4 h-4" /> },
                      { id: "VIRTUAL_ACCOUNT", label: "BCA Virtual Account", icon: <Building className="w-4 h-4" /> },
                      { id: "CREDIT_CARD", label: "Credit / Debit Card", icon: <CreditCard className="w-4 h-4" /> },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                          paymentMethod === pm.id
                            ? "bg-indigo-950/60 border-indigo-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {pm.icon}
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{currentTier?.name} (x{quantity})</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Amount</span>
                  <span className="text-indigo-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Processing Secure Order..."
                ) : (
                  <>
                    <span>Complete Order & Issue Ticket ({formatCurrency(total)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
