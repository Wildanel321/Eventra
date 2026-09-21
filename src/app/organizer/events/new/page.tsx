import React from "react";
import { EventWizard } from "@/components/events/EventWizard";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          Creation Studio
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
          Event Creator Wizard
        </h1>
        <p className="text-xs text-slate-400">
          Follow the 8 guided steps to configure tickets, custom questions, speakers, and publish your event.
        </p>
      </div>

      <EventWizard />
    </div>
  );
}
