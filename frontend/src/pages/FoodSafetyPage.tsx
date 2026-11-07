import React from 'react';
import { ShieldCheck, Thermometer, AlertTriangle, CheckCircle, Clock, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FoodSafetyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Food Safety & Hygiene Standard Operating Procedures
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          FoodBridge follows strict FSSAI surplus food handling guidelines and Good Samaritan protection principles to guarantee the safety of every meal delivered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <Thermometer className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Temperature Control</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cooked hot food must be maintained above 60°C or cooled below 5°C within two hours of preparation. Chilled desserts and salads must remain below 8°C during transit.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">The 4-Hour Rule</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Perishable cooked meals held at room temperature must be picked up, transported, and consumed within a strict 4-hour window before automatic system expiration.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-fit">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Allergen Declarations</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Donors must explicitly specify major allergens including peanuts, tree nuts, gluten, dairy, soy, shellfish, and mustard to protect vulnerable community members.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Acceptable Food Items Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Accepted Donations
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Untouched surplus prepared foods from commercial kitchens and catered banquets</li>
              <li>• Fresh baked bread, pastries, and buns from licensed bakeries</li>
              <li>• Sealed, unopened packaged foods well within 'Best Before' dates</li>
              <li>• Fresh unpeeled fruits and whole raw vegetables</li>
              <li>• Surplus hotel breakfast/buffet chafing dish portions kept under temperature</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Prohibited Items
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Partially consumed or plate-scraped leftovers from dining tables</li>
              <li>• Raw meat, poultry, or fish requiring unmonitored home cooking</li>
              <li>• Unpasteurized milk products or swollen canned containers</li>
              <li>• Food with signs of spoilage, sour odors, or mold growth</li>
              <li>• High-risk food stored past safe holding temperatures</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-bold">Good Samaritan Donor Protection</h3>
          <p className="text-xs text-emerald-200 max-w-xl">
            Under national food safety frameworks, bona fide donors acting in good faith who donate surplus food complying with safety SOPs are legally protected from civil and criminal liability.
          </p>
        </div>
        <Link
          to="/register?role=DONOR"
          className="shrink-0 px-5 py-2.5 bg-white text-emerald-900 rounded-xl font-bold text-xs hover:bg-emerald-50 transition"
        >
          Register as Donor
        </Link>
      </div>
    </div>
  );
};
