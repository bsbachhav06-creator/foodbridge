import React from 'react';
import { HeartHandshake, Shield, Sparkles, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Food<span className="text-emerald-400">Bridge</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">
              A community-driven food waste redistribution network bridging surplus kitchens, restaurants, and caterers with verified NGOs and volunteer logistics.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Formula: 1 kg Food Saved ≈ 2.5 kg CO₂ Reduced
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition">Home & Impact</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition">Food Safety Guidelines</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition">Register Organization</Link></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Compliance</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Good Samaritan Safety Policy
              </li>
              <li>FSSAI Surplus Hygiene Code</li>
              <li>Cold-Chain Transportation SOP</li>
              <li>Admin Verification Protocol</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} FoodBridge Network. Final Year Capstone Project. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Spring Boot 3 & React TypeScript.
          </p>
        </div>
      </div>
    </footer>
  );
};
