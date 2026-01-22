import { forwardRef } from 'react';
import { StackItem, TIMING_LABELS } from '@/types/supplement';
import { Sunrise, Sun, Moon, Clock } from 'lucide-react';

interface PrintableScheduleProps {
  stack: StackItem[];
  morningSupplements: StackItem[];
  withFoodSupplements: StackItem[];
  eveningSupplements: StackItem[];
  anytimeSupplements: StackItem[];
}

export const PrintableSchedule = forwardRef<HTMLDivElement, PrintableScheduleProps>(
  ({ stack, morningSupplements, withFoodSupplements, eveningSupplements, anytimeSupplements }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div ref={ref} className="print:block hidden bg-white text-black p-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold mb-2">Daily Supplement Schedule</h1>
            <p className="text-gray-600">{currentDate}</p>
            <p className="text-sm text-gray-500 mt-1">{stack.length} supplements total</p>
          </div>

          {/* Schedule Grid */}
          <div className="space-y-6">
            {/* Morning */}
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <Sunrise className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Morning</h2>
                <span className="text-sm text-gray-500">(Empty stomach or first thing)</span>
              </div>
              {morningSupplements.length === 0 ? (
                <p className="text-gray-400 italic">No morning supplements</p>
              ) : (
                <ul className="space-y-2">
                  {morningSupplements.map(item => (
                    <li key={item.supplement.id} className="flex items-start gap-3">
                      <span className="w-4 h-4 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{item.supplement.name}</span>
                        <span className="text-sm text-gray-600 ml-2">— {item.supplement.dosage_info}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* With Meals */}
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <Sun className="h-5 w-5" />
                <h2 className="text-xl font-semibold">With Meals</h2>
                <span className="text-sm text-gray-500">(Take with food for absorption)</span>
              </div>
              {withFoodSupplements.length === 0 ? (
                <p className="text-gray-400 italic">No meal-time supplements</p>
              ) : (
                <ul className="space-y-2">
                  {withFoodSupplements.map(item => (
                    <li key={item.supplement.id} className="flex items-start gap-3">
                      <span className="w-4 h-4 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{item.supplement.name}</span>
                        <span className="text-sm text-gray-600 ml-2">— {item.supplement.dosage_info}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Evening */}
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <Moon className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Evening</h2>
                <span className="text-sm text-gray-500">(Before bed or with dinner)</span>
              </div>
              {eveningSupplements.length === 0 ? (
                <p className="text-gray-400 italic">No evening supplements</p>
              ) : (
                <ul className="space-y-2">
                  {eveningSupplements.map(item => (
                    <li key={item.supplement.id} className="flex items-start gap-3">
                      <span className="w-4 h-4 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{item.supplement.name}</span>
                        <span className="text-sm text-gray-600 ml-2">— {item.supplement.dosage_info}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Any Time */}
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <Clock className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Any Time</h2>
                <span className="text-sm text-gray-500">(Flexible timing)</span>
              </div>
              {anytimeSupplements.length === 0 ? (
                <p className="text-gray-400 italic">No flexible supplements</p>
              ) : (
                <ul className="space-y-2">
                  {anytimeSupplements.map(item => (
                    <li key={item.supplement.id} className="flex items-start gap-3">
                      <span className="w-4 h-4 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{item.supplement.name}</span>
                        <span className="text-sm text-gray-600 ml-2">— {item.supplement.dosage_info}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8 border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <div className="h-24 border border-dashed border-gray-300 rounded" />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Generated by Supplement Stack Builder</p>
            <p className="mt-1">Consult a healthcare professional before starting any supplement regimen.</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableSchedule.displayName = 'PrintableSchedule';
